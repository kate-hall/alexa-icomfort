'use strict';

const assert = require('assert');

const iComfortClient = require('../src/index.js');

const debugging = Boolean((process.env['NODE_DEBUG'] == 1));

function logResponse (res) {
    if (debugging) {
        console.log(JSON.stringify(res, null, 2));
    }

    return res;
}

describe('tests the iComfort client', () => {
    const ENV = {
        USERNAME: process.env['ICOMFORT_USERNAME'],
        PASSWORD: process.env['ICOMFORT_PASSWORD'],
        GATEWAY_SN: process.env['ICOMFORT_GATEWAY_SERIAL'],
    };
    const auth = {username: ENV.USERNAME, password: ENV.PASSWORD};

    let icomfort;

    before('creates an iComfort client', () => icomfort = new iComfortClient(auth));

    it('instantiates the client without the \'new\' keyword', () => {
        const icomfortClient = iComfortClient(auth);

        assert((icomfortClient instanceof iComfortClient), 'icomfortClient is not an instance of iComfortClient');
    });

    it('gets buildings info (getBuildingsInfo)', () => {
        const getBuildingsInfoParams = {UserId:ENV.USERNAME};

        return icomfort.getBuildingsInfo(getBuildingsInfoParams).then(logResponse);
    });

    it('gets gateway info (getGatewayInfo)', () => {
        const getGatewayInfoParams = {GatewaySN:ENV.GATEWAY_SN, TempUnit: 0};

        return icomfort.getGatewayInfo(getGatewayInfoParams).then(logResponse);
    });

    it('gets gateway alerts (getGatewaysAlerts)', () => {
        const getGatewaysAlertsParams = {gatewaysn:ENV.GATEWAY_SN};

        return icomfort.getGatewaysAlerts(getGatewaysAlertsParams).then(logResponse);
    });

    it('gets system info (getSystemsInfo)', () => {
        const getSystemsInfoParams = {UserId:ENV.USERNAME};

        return icomfort.getSystemsInfo(getSystemsInfoParams).then(logResponse);
    });

    it('gets thermostat info list (getThermostatInfoList)', () => {
        const getThermostatInfoListParams = {GatewaySN:ENV.GATEWAY_SN, TempUnit: 0};

        return icomfort.getThermostatInfoList(getThermostatInfoListParams).then(logResponse);
    });

    it('gets thermostat lookup info (getThermostatLookupInfo)', () => {
        const getThermostatLookupInfoParams = {gatewaysn:ENV.GATEWAY_SN, name: 'all'};

        return icomfort.getThermostatLookupInfo(getThermostatLookupInfoParams).then(logResponse);
    });

    it('gets thermostat schedule info (getThermostatScheduleInfo)', () => {
        const getThermostatScheduleInfoParams = {gatewaysn:ENV.GATEWAY_SN};

        return icomfort.getThermostatScheduleInfo(getThermostatScheduleInfoParams).then(logResponse);
    });

    it('validates user (validateUser)', () => {
        const validateUserData = {UserName:ENV.USERNAME};

        return icomfort.validateUser(validateUserData).then(logResponse);
    });

    describe('updates thermostat settings (setThermostatInfo)', () => {
        let currentSettings;

        before('get current settings',() => {
            return getCurrentSettings(icomfort, ENV.GATEWAY_SN)
                .then(res => currentSettings=res);
        });

        it('updates the temperature', () => {
            const newOptions = {
                Cool_Set_Point: currentSettings.Cool_Set_Point+2,
                Heat_Set_Point: currentSettings.Heat_Set_Point+2
            };
            const newSettings = Object.assign({}, currentSettings, newOptions);

            return icomfort.setThermostatInfo(newSettings).then(logResponse);
        });

        xit('sets the program schedule mode', () => {
            const programModeOptions = {
                hidden_gateway_SN:          ENV.GATEWAY_SN,
                zoneNumber:                 currentSettings.Zone_Number,
                Current_HeatPoint:          currentSettings.Heat_Set_Point+2,
                Current_CoolPoint:          currentSettings.Cool_Set_Point+2,
                Current_FanValue:           currentSettings.Fan_Mode,
                Program_Schedule_Mode:      (parseInt(currentSettings.Program_Schedule_Mode)) === 1 ? 0 : 1,
                Operation_Mode:             currentSettings.Operation_Mode,
                Program_Schedule_Selection: currentSettings.Program_Schedule_Selection,
                Pref_Temp_Units:            currentSettings.Pref_Temp_Units,
            };

            return icomfort.setProgramMode(programModeOptions).then(logResponse);
        });

        after(() => icomfort.setThermostatInfo(currentSettings));
    });

    describe('changes away mode setting',() => {
        let currentSettings, currentAwayMode;

        before('get current settings',() => {
            return getCurrentSettings(icomfort, ENV.GATEWAY_SN)
                .then(res => currentSettings=res);
        });

        it('updates the away mode', () => {
            currentAwayMode = {
                'awaymode': currentSettings.Away_Mode,
                'coolsetpoint': currentSettings.Cool_Set_Point,
                'fanmode': currentSettings.Fan_Mode,
                'gatewaysn': currentSettings.GatewaySN,
                'heatsetpoint': currentSettings.Heat_Set_Point,
                'zonenumber': currentSettings.Zone_Number,
            };
            const newOptions = {
                'awaymode': currentSettings.Away_Mode ? 0 : 1 ,
                'coolsetpoint': currentSettings.Cool_Set_Point-10,
                'heatsetpoint': currentSettings.Heat_Set_Point+6,
            };
            const newSettings = Object.assign({}, currentAwayMode, newOptions);

            return icomfort.setAwayMode(newSettings).then(logResponse);
        });

        after(() => icomfort.setAwayMode(currentAwayMode).then(logResponse));
    });
});

function getCurrentSettings (icomfortClient, serialnumber) {
    const getThermostatInfoListParams = {GatewaySN:serialnumber, TempUnit: 0};

    return icomfortClient.getThermostatInfoList(getThermostatInfoListParams)
        .then(res => {
            return res.tStatInfo.find(tStat => tStat.GatewaySN === serialnumber);
        });
}