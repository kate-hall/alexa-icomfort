'use strict';

const iComfort = require('../src/iComfort');

/* auth defined globally in src/iComfort.js */
const authUserId = global.auth.username;

describe('iComfort', function() {
    var iComfortSerial;

    /* Test 1 = Retrieves appliance ID for later lookups and system name for Alexa device naming */
    it('should getSystemsInfo', function() {
        expect(authUserId).toBeTruthy();

        const getSystemsInfoParams = {UserId: authUserId};

        return iComfort
            .getSystemsInfo(getSystemsInfoParams)
            .then(function(systemInfo) {
                console.log(JSON.stringify(systemInfo, null, 4));
                iComfortSerial = systemInfo.Systems[0].Gateway_SN; // Used in subsequent tests
                expect(iComfortSerial).toBeTruthy();
            });
    });

    /* Test 2 = Contains current temperature parameters to overwrite when changing temperature */
    it('should getThermostatInfoList', function() {
        expect(iComfortSerial).toBeTruthy();

        const getInfoParams = {GatewaySN: iComfortSerial, TempUnit: 0};

        return iComfort
            .getThermostatInfoList(getInfoParams)
            .then(console.log);
    });

    /* Test 3 = Returns data on min and max temperatures of your unit, not used in Alexa Skill */
    it('should getGatewayInfo', function() {
        expect(iComfortSerial).toBeTruthy();

        const getInfoParams = {GatewaySN: iComfortSerial, TempUnit: 0};

        return iComfort
            .getGatewayInfo(getInfoParams)
            .then(console.log);
    });

    /* Test 4 = Careful! This test will change your actual temperature, uncomment to run */
    it.skip('should setThermostatInfo', function() {
        expect(iComfortSerial).toBeTruthy();

        const changeTemperatureTestVars = {
            Away_Mode: 0,
            Central_Zoned_Away: 2,
            ConnectionStatus: 'GOOD',
            Cool_Set_Point: 72,
            DateTime_Mark: '/Date(1483815385897+0000)/',
            Fan_Mode: 0,
            GMT_To_Local: -28800,
            GatewaySN: iComfortSerial,
            Golden_Table_Updated: true,
            Heat_Set_Point: 70,
            Indoor_Humidity: 31,
            Indoor_Temp: 70,
            Operation_Mode: 3,
            Pref_Temp_Units: '0',
            Program_Schedule_Mode: '1',
            Program_Schedule_Selection: 4,
            System_Status: 0,
            Zone_Enabled: 1,
            Zone_Name: 'Zone 1',
            Zone_Number: 0,
            Zones_Installed: 1
        };

        return iComfort
            .setThermostatInfo(changeTemperatureTestVars)
            .then(console.log);
    });
});
