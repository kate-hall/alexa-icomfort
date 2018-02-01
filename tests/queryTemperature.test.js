const handler = require('../src/index').handler;
const iComfort = require('../src/iComfort');

describe('get temperature', function() {
    it('should report back the room temperature', function() {
        var iComfortSerial;

        return iComfort
            .getSystemsInfo({ UserId: global.auth.username })
            .then(function(systemInfo) {
                // Pick thermostat to test with
                iComfortSerial = systemInfo.Systems[0].Gateway_SN;

                const reportStateEvent = {
                    directive: {
                        header: {
                            messageId: "abc-123-def-456",
                            correlationToken: "abcdef-123456",
                            namespace: "Alexa",
                            name: "ReportState",
                            payloadVersion: "3"
                        },
                        endpoint: {
                            endpointId: iComfortSerial,
                            cookie: {},
                            scope:{
                                type:"BearerToken",
                                token:"access-token-from-skill"
                            }
                        },
                        payload: {}
                    }
                };

                return new Promise(function(resolve, reject) {
                    const context = {
                        succeed: resolve,
                        fail: reject
                    };

                    handler(reportStateEvent, context);
                });
            })
            .then(function(result) {
                expect(result).toBeTruthy();
                expect(result).toMatchObject({
                    context: {
                        properties: [
                            {
                                namespace: "Alexa.TemperatureSensor",
                                name: "temperature",
                                value: {
                                    value: expect.any(Number),
                                    scale: "FAHRENHEIT"
                                },
                                timeOfSample: expect.any(String),
                                uncertaintyInMilliseconds: 1000
                            },
                            {
                                namespace: "Alexa.ThermostatController",
                                name: "lowerSetpoint",
                                value: {
                                    value: expect.any(Number),
                                    scale: "FAHRENHEIT"
                                },
                                timeOfSample: expect.any(String),
                                uncertaintyInMilliseconds: 1000
                            },
                            {
                                namespace: "Alexa.ThermostatController",
                                name: "upperSetpoint",
                                value: {
                                    value: expect.any(Number),
                                    scale: "FAHRENHEIT"
                                },
                                timeOfSample: expect.any(String),
                                uncertaintyInMilliseconds: 1000
                            },
                            {
                                namespace: "Alexa.ThermostatController",
                                name: "thermostatMode",
                                value: {
                                    value: expect.any(String),
                                    friendlyName: expect.any(String)
                                },
                                timeOfSample: expect.any(String),
                                uncertaintyInMilliseconds: 1000
                            }
                        ]
                    },
                    event: {
                        header: {
                            namespace: "Alexa",
                            name: "StateReport",
                            payloadVersion: "3",
                            messageId: "abc-123-def-456",
                            correlationToken: "abcdef-123456"
                        },
                        endpoint: {
                            endpointId: iComfortSerial
                        },
                        payload: {}
                    }
                });
            });
    });
});
