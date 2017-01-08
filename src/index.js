var https = require("https"),
    iComfort = require("iComfort");

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
        default:
            console.log("Err: No supported namespace: " + event.header.namespace);
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


    iComfort.getSystemsInfo(getSystemsInfoParams, auth)
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
                        "SetTargetTemperature",
                        "IncrementTargetTemperature",
                        "DecrementTargetTemperature"
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
    if (event.header.namespace === 'Alexa.ConnectedHome.Control') {
        // Retrieve the appliance id and accessToken from the incoming Alexa request.
        var accessToken = event.payload.accessToken;
        var applianceId = event.payload.appliance.applianceId;
        var message_id = event.header.messageId;
        var requestedTempChange = "";
        var confirmation,
            temperatureMode = "AUTO";

        var getThermostatInfoListParams = {
            GatewaySN: applianceId,
            TempUnit: 0
        };

        // Query Lennox for current parameters, perform changes on promise fulfillment
        iComfort.getThermostatInfoList(getThermostatInfoListParams, auth)
        .then( function(tempResponse) {
            // Response data to overwrite with new values and put to Lennox
            var originalTemp = tempResponse.tStatInfo[0].Indoor_Temp;
                toSet = tempResponse.tStatInfo[0];

            // check to see what type of request was made before changing temperature
            switch (event.header.name) {
                case "SetTargetTemperatureRequest":
                    confirmation = "SetTargetTemperatureConfirmation";
                    requestedTempChange = Math.round(cToF(event.payload.targetTemperature.value));
                    // Check to see if heating or cooling and pass back
                    if (requestedTempChange > originalTemp) {
                        temperatureMode = "HEAT";
                    } else if (requestedTempChange < originalTemp) {
                        temperatureMode = "COOL";
                    }
                    break;
                case "IncrementTargetTemperatureRequest":
                    var increment = event.payload.deltaTemperature.value;

                    requestedTempChange = toSet.Indoor_Temp + increment;
                    confirmation = "IncrementTargetTemperatureConfirmation";
                    temperatureMode = "HEAT";
                    break;
                case "DecrementTargetTemperatureRequest":
                    var decrement = event.payload.deltaTemperature.value;

                    requestedTempChange = toSet.Indoor_Temp - decrement;
                    confirmation = "DecrementTargetTemperatureConfirmation";
                    temperatureMode = "COOL";
                    break;
            }

            // set both the Indoor Temp and the Heat Set Point to the new value
            toSet.Indoor_Temp = requestedTempChange;

            // My iComfort requires a minimum 3 degree range between Cool-To and Heat-To settings
            // The following will adjust this 3 degree window depending on the temperatureMode requested
            if (temperatureMode === "COOL") {
                toSet.Cool_Set_Point = requestedTempChange;
                toSet.Heat_Set_Point = requestedTempChange - 3;
            } else if (temperatureMode === "HEAT") {
                toSet.Heat_Set_Point = requestedTempChange;
                toSet.Cool_Set_Point = requestedTempChange + 3;
            }

            // send the change request to Lennox, send a response to Alexa on promise fulfillment
            iComfort.setThermostatInfo(getThermostatInfoListParams, toSet, auth)
            .then( function(newSettings) {
                alexaConfirmation(toSet, confirmation, temperatureMode, originalTemp);
            })
            .catch(console.error);

        })
        .catch(console.error);

        var alexaConfirmation = function(newData, confirmation, tempMode, originalTemp) {
            var result = {
                header: {
                    namespace: "Alexa.ConnectedHome.Control",
                    name: confirmation,
                    payloadVersion: "2",
                    messageId: message_id // reuses initial message ID, probably not desirable?
                },
                payload: {
                    targetTemperature: {
                        value: fToC(newData.Indoor_Temp)
                    }
                },
                temperatureMode: {
                    value: tempMode
                },
                previousState: {
                    targetTemperature: {
                        value: fToC(originalTemp)
                    },
                    mode: {
                        value: tempMode
                    }
                }
            };
            context.succeed(result);
        };

    }
}

// function to convert Celcius (Alexa default) to Farenheit
function cToF(celsius) {
  return celsius * 9 / 5 + 32;
}

// function to convert Farenheit to Celcius (Alexa default)
function fToC(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}
