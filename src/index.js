global.auth = {username: "", password: ""}; // YOUR USERNAME AND PASSWORD FOR MYICOMFORT.COM GO HERE

var iComfort = new (require("icomfort"))(auth);

/**
 * Main entry point.
 * Incoming events from Alexa Lighting APIs are processed via this method.
 */
exports.handler = function(event, context) {
    switch (event.header.namespace) {
        case "Alexa.ConnectedHome.Discovery":
            handleDiscovery(event, context);
            break;
        case "Alexa.ConnectedHome.Control":
            handleControl(event, context);
            break;
        case "Alexa.ConnectedHome.Query":
            handleQuery(event, context);
            break;
        default:
            console.log("Error, unsupported namespace: " + event.header.namespace);
            context.fail("Something went wrong");
            break;
    }
};

/**
 * This method is invoked when we receive a "Discovery" message from Alexa Connected Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given
 * customer.
 */
function handleDiscovery(accessToken, context) {
    // Crafting the response header
    var headers = {
        namespace: "Alexa.ConnectedHome.Discovery",
        name: "DiscoverAppliancesResponse",
        payloadVersion: "2"
    };

    // Response body will be an array of discovered devices
    var appliances = [],
        getSystemsInfoParams = {UserId:auth.username};


    iComfort.getSystemsInfo(getSystemsInfoParams)
        .then( function(systemInfo) {
            var systemAppliances = systemInfo.Systems;
            for (var i = 0; i < systemAppliances.length; i++) {
                var thermostat = {
                    applianceId: systemAppliances[i].Gateway_SN,
                    manufacturerName: "Lennox",
                    modelName: "iComfort WiFi",
                    version: systemAppliances[i].Firmware_Ver,
                    friendlyName: systemAppliances[i].System_Name, // Name can be changed in iComfort
                    friendlyDescription: "Lennox iComfort Thermostat",
                    isReachable: true,
                    actions:[
                        "getTemperatureReading",
                        "getTargetTemperature",
                        "setTargetTemperature",
                        "incrementTargetTemperature",
                        "decrementTargetTemperature"
                    ],
                    additionalApplianceDetails: {}
                };
                appliances.push(thermostat);
            }
            var payloads = {
                discoveredAppliances: appliances
            };
            var result = {
                header: headers,
                payload: payloads
            };

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
    var applianceId = event.payload.appliance.applianceId;
    var message_id = event.header.messageId;
    var confirmation;

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
        // Lennox temperature returned in Farenheit, convert to Celsius for Alexa
        var currentParams = {
                systemStatus: responses[0].tStatInfo[0].System_Status,
                allowedRange: responses[1].Heat_Cool_Dead_Band,
                currentTemp: fToC(responses[0].tStatInfo[0].Indoor_Temp),
                currentHeatTo: fToC(responses[0].tStatInfo[0].Heat_Set_Point),
                currentCoolTo: fToC(responses[0].tStatInfo[0].Cool_Set_Point),
                toSet: responses[0].tStatInfo[0]
            },
            newParams = {};

        // check to see what type of request was made before changing temperature
        switch (event.header.name) {
            case "SetTargetTemperatureRequest":
                currentParams.requestedTemp = event.payload.targetTemperature.value;
                newParams = determineNewParameters(currentParams);
                confirmation = "SetTargetTemperatureConfirmation";
                break;
            case "IncrementTargetTemperatureRequest":
                var increment = event.payload.deltaTemperature.value;

                currentParams.requestedTemp = fToC(currentParams.toSet.Indoor_Temp) + increment;
                newParams = determineNewParameters(currentParams);
                confirmation = "IncrementTargetTemperatureConfirmation";
                break;
            case "DecrementTargetTemperatureRequest":
                var decrement = event.payload.deltaTemperature.value;

                currentParams.requestedTemp = fToC(currentParams.toSet.Indoor_Temp) - decrement;
                newParams = determineNewParameters(currentParams);
                confirmation = "DecrementTargetTemperatureConfirmation";
                break;
        }

        // send the change request to Lennox, send a response to Alexa on promise fulfillment
        iComfort.setThermostatInfo(newParams.toSet)
        .then( function(newSettings) {
            alexaChangeConfirmation(newParams.alexaTargetTemp, confirmation, newParams.temperatureMode, currentParams.currentTemp);
        })
        .catch(console.error);

    })
    .catch(console.error);

    var alexaChangeConfirmation = function(targetTemp, confirmation, tempMode, originalTemp) {
        var result = {
            header: {
                namespace: "Alexa.ConnectedHome.Control",
                name: confirmation,
                payloadVersion: "2",
                messageId: message_id // reuses initial message ID, probably not desirable?
            },
            payload: {
                targetTemperature: {
                    value: targetTemp
                }
            },
            temperatureMode: {
                value: tempMode
            },
            previousState: {
                targetTemperature: {
                    value: originalTemp
                },
                mode: {
                    value: tempMode
                }
            }
        };
        context.succeed(result);
    };
}

/**
 * Control events are processed here.
 * This is called when Alexa requests an action (e.g., "turn off appliance").
 */
function handleQuery(event, context) {
    // Retrieve the appliance id and accessToken from the incoming Alexa request.
    var applianceId = event.payload.appliance.applianceId;
    var message_id = event.header.messageId;
    var confirmation;

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
        // Lennox temperature returned in Farenheit, convert to Celsius for Alexa
        var currentParams = {
                timestamp: new Date(parseInt(responses[0].tStatInfo[0].DateTime_Mark.replace("/Date(","").replace(")/",""), 10)),
                programMode: responses[0].tStatInfo[0].Program_Schedule_Selection,
                currentTemp: fToC(responses[0].tStatInfo[0].Indoor_Temp),
                currentHeatTo: fToC(responses[0].tStatInfo[0].Heat_Set_Point),
                currentCoolTo: fToC(responses[0].tStatInfo[0].Cool_Set_Point)
        };

        // check to see what type of request was made before changing temperature
        switch (event.header.name) {
            case "GetTemperatureReadingRequest":
                confirmation = "GetTemperatureReadingResponse";
                alexaCurrentTempInfo(currentParams.currentTemp, currentParams.timestamp, confirmation);
                break;
            case "GetTargetTemperatureRequest":
                confirmation = "GetTargetTemperatureResponse";
                alexaTargetRangeInfo(currentParams.currentTemp, currentParams.currentHeatTo, currentParams.currentCoolTo, currentParams.programMode, currentParams.timestamp, confirmation);
                break;
        }

    })
    .catch(console.error);

    var alexaCurrentTempInfo = function(currentTemp, timeStamp, confirmation) {
        var result = {
            header: {
                namespace: "Alexa.ConnectedHome.Query",
                name: confirmation,
                payloadVersion: "2",
                messageId: message_id // reuses initial message ID, probably not desirable?
            },
            payload: {
                temperatureReading: {
                    value: currentTemp
                },
                applianceResponseTimestamp: timeStamp.toISOString()
            }
        };
        context.succeed(result);
    };

    var alexaTargetRangeInfo = function(currentTemp, heatTo, coolTo, program, timeStamp, confirmation) {
        var programToTempMode = {
            0: {tempMode: "CUSTOM", friendlyName: "Summer"},
            1: {tempMode: "CUSTOM", friendlyName: "Winter"},
            2: {tempMode: "CUSTOM", friendlyName: "Spring Fall"},
            3: {tempMode: "ECO", friendlyName: "Save Energy"},
            4: {tempMode: "CUSTOM", friendlyName: "Custom"}
        };
        var result = {
            header: {
                namespace: "Alexa.ConnectedHome.Query",
                name: confirmation,
                payloadVersion: "2",
                messageId: message_id // reuses initial message ID, probably not desirable?
            },
            payload: {
                temperatureReading: {
                    value: currentTemp
                },
                coolingTargetTemperature: {
                    value: coolTo
                },
                heatingTargetTemperature: {
                    value: heatTo
                },
                applianceResponseTimestamp: timeStamp.toISOString(),
                temperatureMode: {
                    value: programToTempMode[program].tempMode,
                    friendlyName: programToTempMode[program].friendlyName
                }
            }
        };
        context.succeed(result);
    };

}

function determineNewParameters(currentParams) {
    var newParams = {
            temperatureMode: "AUTO",
            alexaTargetTemp: currentParams.requestedTemp, // in Celsius
            toSet: currentParams.toSet
        },
        dropTemp = (currentParams.currentTemp - currentParams.requestedTemp) > 0; // if this evaluates to false, we stay at the same temp OR increase temp

    newParams.toSet.Indoor_Temp = Math.round(cToF(currentParams.requestedTemp));

    // System_Status magic numbers: 0 == idle, 1 == heating, 2 == cooling, 3 == waiting

    // temp is at bottom of current range, i.e. it's colder outside than inside, OR system is heating
    if ((currentParams.currentTemp - currentParams.currentHeatTo) < (currentParams.currentCoolTo - currentParams.currentTemp) || currentParams.systemStatus === 1) {
        // raise or lower the bottom accordingly
        newParams.toSet.Heat_Set_Point = Math.round(cToF(currentParams.requestedTemp));
        // check to see if existing top is at least the allowed range above the new bottom, if not, raise it at least that much
        if (!dropTemp && (newParams.toSet.Heat_Set_Point + currentParams.allowedRange) > newParams.toSet.Cool_Set_Point) {
            newParams.toSet.Cool_Set_Point = newParams.toSet.Heat_Set_Point + currentParams.allowedRange;
        }
    }
    // temp is at top of current range, i.e. it's hotter outside than inside, OR system is cooling
    else if ((currentParams.currentTemp - currentParams.currentHeatTo) > (currentParams.currentCoolTo - currentParams.currentTemp) || currentParams.systemStatus === 2) {
        // raise or lower the top accordingly
        newParams.toSet.Cool_Set_Point = Math.round(cToF(currentParams.requestedTemp));
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

    return newParams;
}

// function to convert Celcius (Alexa default) to Farenheit
function cToF(celsius) {
  return celsius * 9 / 5 + 32;
}

// function to convert Farenheit to Celcius (Alexa default)
function fToC(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}
