'use strict';

const handler = require('../src/index').handler;
const iComfort = require('../src/iComfort');

describe('Set Target Temperature', function() {
    var origSetFn;
    var mockSetFn;

    var iComfortSerial;

    beforeAll(function() {
        // Mock setThermostatInfo so we don't send real temperature commands to iComfort during tests.
        origSetFn = iComfort.setThermostatInfo;
        mockSetFn = jest.fn(function() { return Promise.resolve(); });
        iComfort.setThermostatInfo = mockSetFn;

        return iComfort
            .getSystemsInfo({ UserId: global.auth.username })
            .then(function(systemInfo) {
                // Pick thermostat to test with
                iComfortSerial = systemInfo.Systems[0].Gateway_SN;
            });
    });

    afterEach(function() {
        // clear call-counts on the mock(s)
        jest.clearAllMocks()
    });

    afterAll(function() {
        // Restore to non-mocked
        iComfort.setThermostatInfo = origSetFn;
    });

    it('should send expected payload to Alexa', function() {
        const alexaSetTempEvent = getSetTargetEvent(72, iComfortSerial);

        return new Promise(function(resolve, reject) {
            const context = {
                succeed: resolve,
                fail: reject
            };

            handler(alexaSetTempEvent, context);
        }).then(function(result) {
            expect(result).toBeTruthy();
            expect(result).toMatchObject({
                context: {
                    properties: [
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
                            value: "HEAT",
                            timeOfSample: expect.any(String),
                            uncertaintyInMilliseconds: 1000
                        }
                    ]
                },
                event: {
                    header: {
                        namespace: "Alexa",
                        name: "Response",
                        payloadVersion: "3",
                        messageId: expect.any(String),
                        correlationToken: expect.any(String)
                    },
                    endpoint: {
                        endpointId: iComfortSerial
                    },
                    payload: {}
                }
            });

            expect(mockSetFn).toHaveBeenCalledTimes(1);
        });
    });

    it('should refuse if target temperature is out of range', function() {
        const crazyEvent = getSetTargetEvent(6080, iComfortSerial);

        return new Promise(function(resolve, reject) {
            const context = {
                succeed: resolve,
                fail: reject
            };

            handler(crazyEvent, context);
        }).then(function(result) {
            expect(result).toBeTruthy();
            expect(result).toMatchObject({
                event: {
                    header: {
                        namespace: "Alexa",
                        name: "ErrorResponse",
                        messageId: expect.any(String),
                        correlationToken: "anything",
                        payloadVersion: "3"
                    },
                    endpoint: {
                        endpointId: iComfortSerial
                    },
                    payload: {
                        type: "TEMPERATURE_VALUE_OUT_OF_RANGE",
                        message: "The requested temperature of 6080 is out of range",
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
                    }
                }
            });

            expect(mockSetFn).not.toHaveBeenCalled();
        });
    });
});

function getSetTargetEvent(targetTemp, endpointId) {
    return {
        directive: {
            header: {
                namespace: "Alexa.ThermostatController",
                name: "SetTargetTemperature",
                payloadVersion: "3",
                messageId: "something-75b3-4fbb-bf5e-a0bd5468a121",
                correlationToken: "anything"
            },
            endpoint: {
                scope: {
                    type: "BearerToken",
                    token: "AnythingCanBeAToken"
                },
                endpointId: endpointId,
                cookie: {}
            },
            payload: {
                targetSetpoint: {
                    value: targetTemp,
                    scale: "FAHRENHEIT"
                }
            }
        }
    };
}
