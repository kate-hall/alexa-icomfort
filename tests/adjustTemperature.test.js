'use strict';

const handler = require('../src/index').handler;
const iComfort = require('../src/iComfort');

describe('Adjust Target Temperature', function() {
    var origSetFn;
    var mockSetFn;

    beforeAll(function() {
        // Mock setThermostatInfo so we don't send real temperature commands to iComfort during tests.
        origSetFn = iComfort.setThermostatInfo;
        mockSetFn = jest.fn(function() { return Promise.resolve(); });
        iComfort.setThermostatInfo = mockSetFn;
    });

    afterAll(function() {
        // Restore to non-mocked
        iComfort.setThermostatInfo = origSetFn;
    });

    it('should send expected payload to Alexa', function() {
        var iComfortSerial;

        return iComfort
            .getSystemsInfo({ UserId: global.auth.username })
            .then(function(systemInfo) {
                // Pick thermostat to test with
                iComfortSerial = systemInfo.Systems[0].Gateway_SN;

                // fudge the payload to include our iComfort SN
                const alexaAdjustTempEvent = require('./data/AlexaIncreaseTemperature.json');
                alexaAdjustTempEvent.directive.endpoint.endpointId = iComfortSerial;

                return new Promise(function(resolve, reject) {
                    const context = {
                        succeed: resolve,
                        fail: reject
                    };

                    handler(alexaAdjustTempEvent, context);
                });
            })
            .then(function(result) {
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
                                value: expect.stringMatching(/AUTO|COOL|HEAT|OFF/),
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
});
