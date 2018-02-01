const handler = require('../src/index').handler;

const discoveryEvent = require('./data/AlexaDiscovery');

describe('discovery', function() {
    test('reply to discover event', function() {
        return new Promise(function(resolve, reject) {
            const context = {
                succeed: resolve,
                fail: reject
            };

            handler(discoveryEvent, context);
        }).then(function(result) {
            expect(result).toBeTruthy();
            expect(result).toMatchObject({
                event: {
                    header: {
                        namespace: "Alexa.Discovery",
                        name: "Discover.Response",
                        payloadVersion: "3",
                        messageId: expect.any(String)
                    },
                    payload: {
                        endpoints: [
                            {
                                endpointId: expect.any(String),
                                manufacturerName: "Lennox",
                                version: expect.any(String),
                                friendlyName: expect.any(String),
                                description: expect.any(String),
                                displayCategories: [
                                    "THERMOSTAT",
                                    "TEMPERATURE_SENSOR"
                                ],
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
                            }
                        ]
                    }
                }
            });
        });
    });
});
