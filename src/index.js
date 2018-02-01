'use strict';

var iComfort = require('./iComfort');

/**
 * Set environment variable DEBUG=1 in Lambda to see more info the CloudWatch Logs.
 */
const debugMode = !!process.env.DEBUG;

/**
 * Main entry point.
 * Incoming events from Alexa Lighting APIs are processed via this method.
 */
exports.handler = function(event, context) {
    const namespace = event.directive.header.namespace;
    const name = event.directive.header.name;
    const command = namespace + '.' + name;

    debug('Event from Alexa: ' + JSON.stringify(event, null, 4));

    switch (command) {
        case "Alexa.Discovery.Discover":
            handleDiscovery(event, context);
            break;
        case "Alexa.ThermostatController.SetTargetTemperature":
        case "Alexa.ThermostatController.AdjustTargetTemperature":
            handleControl(event, context);
            break;
        case "Alexa.ReportState":
            handleQuery(event, context);
            break;
        default:
            console.log("Error, unsupported command: " + command);
            context.fail("Something went wrong");
            break;
    }
};

function debug(msg) {
    if (debugMode) {
        if (typeof msg === 'object') {
            console.log(JSON.stringify(msg, null, 4));
        }
        else {
            console.log(msg);
        }
    }
}

/**
 * This method is invoked when we receive a "Discovery" message from Alexa Connected Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given
 * customer.
 */
function handleDiscovery(event, context) {
    // Crafting the response header
    var headers = {
        namespace: "Alexa.Discovery",
        name: "Discover.Response",
        payloadVersion: "3",
        messageId: event.directive.header.messageId
    };

    // Response body will be an array of discovered devices
    var appliances = [],
        getSystemsInfoParams = {UserId:global.auth.username};


    iComfort.getSystemsInfo(getSystemsInfoParams)
        .then( function(systemInfo) {
            var systemAppliances = systemInfo.Systems;
            for (var i = 0; i < systemAppliances.length; i++) {
                var thermostat = {
                    endpointId: systemAppliances[i].Gateway_SN,
                    manufacturerName: "Lennox",
                    version: systemAppliances[i].Firmware_Ver,
                    friendlyName: systemAppliances[i].System_Name, // Name can be changed in iComfort
                    description: "Lennox iComfort Thermostat",
                    displayCategories: ["THERMOSTAT", "TEMPERATURE_SENSOR"],
                    capabilities: [
                        {
                            type: "AlexaInterface",
                            interface: "Alexa.ThermostatController",
                            version: "3",
                            properties: {
                                supported: [
                                    {
                                        name: "lowerSetpoint"
                                    },
                                    {
                                        name: "targetSetpoint"
                                    },
                                    {
                                        name: "upperSetpoint"
                                    }
                                ],
                                proactivelyReported: true,
                                retrievable: true
                            }
                        },
                        {
                            type: "AlexaInterface",
                            interface: "Alexa.TemperatureSensor",
                            version: "3",
                            properties: {
                                supported: [
                                    {
                                        name: "temperature"
                                    }
                                ],
                                proactivelyReported: true,
                                retrievable: true
                            }
                        }
                    ],
                    cookie: {}
                };
                appliances.push(thermostat);
            }

            var result = {
                event: {
                    header: headers,
                    payload: {
                        endpoints: appliances
                    }
                }
            };

            debug(result);
            context.succeed(result);
        })
        .catch(console.error);
}


/**
 * Control events are processed here.
 * This is called when Alexa requests an action (e.g., "turn off appliance").
 */
function handleControl(event, context) {
    // Retrieve the appliance id from the incoming Alexa request.
    var applianceId = event.directive.endpoint.endpointId;
    var message_id = event.directive.header.messageId;
    var correlationToken = event.directive.header.correlationToken;

    var payload = event.directive.payload;

    var getThermostatInfoListParams = {
        GatewaySN: applianceId,
        TempUnit: 0
    };

    // Query Lennox for current parameters and potential temp spread, perform changes on promise fulfillments
    Promise.all([
        iComfort.getThermostatInfoList(getThermostatInfoListParams),
        iComfort.getGatewayInfo(getThermostatInfoListParams)
    ])
    .then( function(responses) {
        // Response data to overwrite with new values and put to Lennox
        var currentParams = {
                timestamp: new Date(parseInt(responses[0].tStatInfo[0].DateTime_Mark.replace("/Date(","").replace(")/",""), 10)),
                awayMode: responses[0].tStatInfo[0].Away_Mode,
                systemStatus: responses[0].tStatInfo[0].System_Status,
                allowedRange: responses[1].Heat_Cool_Dead_Band,
                currentTemp: responses[0].tStatInfo[0].Indoor_Temp,
                currentHeatTo: responses[0].tStatInfo[0].Heat_Set_Point,
                currentCoolTo: responses[0].tStatInfo[0].Cool_Set_Point,
                toSet: responses[0].tStatInfo[0]
            },
            newParams = {};

        // check to see what type of request was made before changing temperature
        switch (event.directive.header.name) {
            case "SetTargetTemperature": {
                const alexaValue = payload.targetSetpoint.value;
                const alexaScale = payload.targetSetpoint.scale;

                currentParams.requestedTemp = (alexaScale === "FAHRENHEIT" ? alexaValue : cToF(alexaValue));
                newParams = determineNewParameters(currentParams);
                break;
            }

            case "AdjustTargetTemperature": { // handles both increment and decrement with a positive or negative number
                const alexaDelta = payload.targetSetpointDelta.value;
                const alexaScale = payload.targetSetpointDelta.scale;

                // Increment conversion h/t https://www.convert-me.com/en/convert/temperature-inc/
                const delta = (alexaScale === "FAHRENHEIT" ? alexaDelta : 1.8 * alexaDelta);

                currentParams.requestedTemp = currentParams.currentTemp + delta;
                newParams = determineNewParameters(currentParams);
                break;
            }
        }

        debug('Requested temp: ' + currentParams.requestedTemp);

        if (currentParams.awayMode) {
            // Refuse to change temp in away mode.
            console.log('Will not adjust temperature while system is in away-mode');
            alexaErrorResponse(context, {
                // This was the closest error type I could find.
                // See https://developer.amazon.com/docs/device-apis/alexa-thermostatcontroller.html#errorresponse
                type: "THERMOSTAT_IS_OFF",
                message: "the thermostat is in away-mode, will not adjust temperature"
            });
            return;
        }

        if (newParams.alexaTargetTemp > 99 || newParams.alexaTargetTemp < 60) {
            // Requested value is not in a reasonable range, reject this request
            console.log('Rejecting crazy targetTemp: ' + newParams.alexaTargetTemp);
            alexaErrorResponse(context, {
                type: "TEMPERATURE_VALUE_OUT_OF_RANGE",
                message: "The requested temperature of " + newParams.alexaTargetTemp + " is out of range",
                validRange: {
                    minimumValue: {
                        value: 60.0,
                        scale: "FAHRENHEIT"
                    },
                    maximumValue: {
                        value: 99.0,
                        scale: "FAHRENHEIT"
                    }
                }
            });
            return;
        }

        // send the change request to Lennox, send a response to Alexa on promise fulfillment
        return iComfort.setThermostatInfo(newParams.toSet)
            .then( function(newSettings) {
                alexaChangeConfirmation(newParams, newParams.alexaTargetTemp, newParams.temperatureMode, currentParams);
            });
    })
    .catch(console.error);

    var alexaErrorResponse = function(context, payload) {
        const response = {
            event: {
                header: {
                    namespace: "Alexa",
                    name: "ErrorResponse",
                    messageId: message_id,
                    correlationToken: correlationToken,
                    payloadVersion: "3"
                },
                endpoint: {
                    endpointId: event.directive.endpoint.endpointId
                },
                payload: payload
            }
        };
        debug('Sending error response to Alexa: ' + JSON.stringify(response, null, 4));
        context.succeed(response);
    };

    var alexaChangeConfirmation = function(newParams, targetTemp, tempMode, currentParams) {
        var result = {
            event: {
                header: {
                    namespace: "Alexa",
                    name: 'Response',
                    payloadVersion: "3",
                    correlationToken: correlationToken,
                    messageId: message_id // reuses initial message ID, probably not desirable?
                },
                endpoint: event.directive.endpoint,
                payload: {}
            },
            context: {
                properties: [
                    {
                        namespace: "Alexa.ThermostatController",
                        name: "lowerSetpoint",
                        value: {
                            value: newParams.toSet.Heat_Set_Point,
                            scale: "FAHRENHEIT"
                        },
                        timeOfSample: currentParams.timestamp.toISOString(),
                        uncertaintyInMilliseconds: 1000
                    },
                    {
                        namespace: "Alexa.ThermostatController",
                        name: "upperSetpoint",
                        value: {
                            value: newParams.toSet.Cool_Set_Point,
                            scale: "FAHRENHEIT"
                        },
                        timeOfSample: currentParams.timestamp.toISOString(),
                        uncertaintyInMilliseconds: 1000
                    },
                    {
                        namespace: "Alexa.ThermostatController",
                        name: "thermostatMode",
                        value: tempMode,
                        timeOfSample: currentParams.timestamp.toISOString(),
                        uncertaintyInMilliseconds: 1000
                    }
                ]
            }
        };

        debug(result);
        context.succeed(result);
    };
}

/**
 * Query events are processed here.
 * This is called when Alexa requests state (e.g., "what temperature is the thermostat set to?").
 */
function handleQuery(event, context) {
    // Retrieve the appliance id and accessToken from the incoming Alexa request.
    var applianceId = event.directive.endpoint.endpointId;
    var message_id = event.directive.header.messageId;

    var getThermostatInfoListParams = {
        GatewaySN: applianceId,
        TempUnit: 0
    };

    // Query Lennox for current parameters and potential temp spread, perform changes on promise fulfillments
    Promise.all([
        iComfort.getThermostatInfoList(getThermostatInfoListParams),
        iComfort.getGatewayInfo(getThermostatInfoListParams)
    ])
    .then( function(responses) {
        // Lennox temperature returned in Fahrenheit
        var currentParams = {
                timestamp: new Date(parseInt(responses[0].tStatInfo[0].DateTime_Mark.replace("/Date(","").replace(")/",""), 10)),
                programMode: responses[0].tStatInfo[0].Program_Schedule_Selection,
                operationMode: responses[0].tStatInfo[0].Operation_Mode,
                currentTemp: responses[0].tStatInfo[0].Indoor_Temp,
                currentHeatTo: responses[0].tStatInfo[0].Heat_Set_Point,
                currentCoolTo: responses[0].tStatInfo[0].Cool_Set_Point
        };

        // check to see what type of request was made before reporting temperature
        switch (event.directive.header.name) {
            case "ReportState":
                alexaCurrentTempInfo(currentParams);
                break;
        }

    })
    .catch(console.error);

    var alexaCurrentTempInfo = function(currentParams) {
        const programToTempMode = {
            0: {tempMode: "CUSTOM", friendlyName: "Summer Program"},
            1: {tempMode: "CUSTOM", friendlyName: "Winter Program"},
            2: {tempMode: "CUSTOM", friendlyName: "Spring Fall Program"},
            3: {tempMode: "ECO", friendlyName: "Save Energy Program"},
            4: {tempMode: "CUSTOM", friendlyName: "Custom Program"}
        };

        const program = currentParams.programMode;

        const result = {
            context: {
                properties: [
                    {
                        namespace: "Alexa.TemperatureSensor",
                        name: "temperature",
                        value: {
                            value: currentParams.currentTemp,
                            scale: 'FAHRENHEIT'
                        },
                        timeOfSample: currentParams.timestamp.toISOString(),
                        uncertaintyInMilliseconds: 1000
                    },
                    {
                        namespace: "Alexa.ThermostatController",
                        name: "lowerSetpoint",
                        value: {
                            value: currentParams.currentHeatTo,
                            scale: "FAHRENHEIT"
                        },
                        timeOfSample: currentParams.timestamp.toISOString(),
                        uncertaintyInMilliseconds: 1000
                    },
                    {
                        namespace: "Alexa.ThermostatController",
                        name: "upperSetpoint",
                        value: {
                            value: currentParams.currentCoolTo,
                            scale: "FAHRENHEIT"
                        },
                        timeOfSample: currentParams.timestamp.toISOString(),
                        uncertaintyInMilliseconds: 1000
                    },
                    {
                        namespace: "Alexa.ThermostatController",
                        name: "thermostatMode",
                        value: {
                            value: programToTempMode[program].tempMode,
                            friendlyName: programToTempMode[program].friendlyName
                        },
                        timeOfSample: currentParams.timestamp.toISOString(),
                        uncertaintyInMilliseconds: 1000
                    }
                ]
            },
            event: {
                header: {
                    namespace: "Alexa",
                    name: "StateReport",
                    payloadVersion: "3",
                    correlationToken: event.directive.header.correlationToken,
                    messageId: message_id // reuses initial message ID, probably not desirable?
                },
                endpoint: {
                    endpointId: event.directive.endpoint.endpointId
                },
                payload: {}
            }
        };
        debug(result);
        context.succeed(result);
    };
}

function determineNewParameters(currentParams) {
    var newParams = {
            temperatureMode: "AUTO",
            alexaTargetTemp: currentParams.requestedTemp,
            toSet: currentParams.toSet
        },
        dropTemp = (currentParams.currentTemp - currentParams.requestedTemp) > 0; // if this evaluates to false, we stay at the same temp OR increase temp

    // System_Status magic numbers: 0 == idle, 1 == heating, 2 == cooling, 3 == waiting

    // temp is at bottom of current range, i.e. it's colder outside than inside, OR system is heating
    if ((currentParams.currentTemp - currentParams.currentHeatTo) < (currentParams.currentCoolTo - currentParams.currentTemp) || currentParams.systemStatus === 1) {
        // raise or lower the bottom accordingly
        newParams.toSet.Heat_Set_Point = currentParams.requestedTemp;
        // check to see if existing top is at least the allowed range above the new bottom, if not, raise it at least that much
        if (!dropTemp && (newParams.toSet.Heat_Set_Point + currentParams.allowedRange) > newParams.toSet.Cool_Set_Point) {
            newParams.toSet.Cool_Set_Point = newParams.toSet.Heat_Set_Point + currentParams.allowedRange;
        }
    }
    // temp is at top of current range, i.e. it's hotter outside than inside, OR system is cooling
    else if ((currentParams.currentTemp - currentParams.currentHeatTo) > (currentParams.currentCoolTo - currentParams.currentTemp) || currentParams.systemStatus === 2) {
        // raise or lower the top accordingly
        newParams.toSet.Cool_Set_Point = currentParams.requestedTemp;
        // check to see if existing bottom is at least the allowed range above the new top, if not, raise it at least that much
        if (dropTemp && (newParams.toSet.Cool_Set_Point - currentParams.allowedRange) < newParams.toSet.Heat_Set_Point) {
            newParams.toSet.Heat_Set_Point = newParams.toSet.Cool_Set_Point - currentParams.allowedRange;
        }
    }

    if (currentParams.requestedTemp > currentParams.currentTemp) {
        newParams.temperatureMode = "HEAT";
    } else if (currentParams.requestedTemp < currentParams.currentTemp) {
        newParams.temperatureMode = "COOL";
    }

    debug('determineNewParameters() => ' + JSON.stringify(newParams, null, 4));

    return newParams;
}

// Convert Celsius to Fahrenheit and round to nearest integer
function cToF(celsius) {
    return Math.round((celsius * 9 / 5) + 32);
}
