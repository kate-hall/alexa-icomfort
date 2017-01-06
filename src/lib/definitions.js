'use strict';

const params = require('./params');

module.exports = {
    getBuildingsInfo: {
        path: '/GetBuildingsInfo',
        paramsDef: {
            'UserId': params.USER_ID
        }
    },
    getGatewayInfo: {
        path: '/GetGatewayInfo',
        paramsDef: {
            'GatewaySN': params.GATEWAY_SERIAL_NUMBER,
            'TempUnit': params.TEMPERATURE_UNIT
        }
    },
    getGatewaysAlerts: {
        path: '/GetGatewaysAlerts',
        paramsDef: {
            'gatewaysn': params.GATEWAY_SERIAL_NUMBER,
        }
    },
    getThermostatInfoList: {
        path: '/GetTStatInfoList',
        paramsDef: {
            'Cancel_Away': params.CANCEL_AWAY_FLAG,
            'GatewaySN': params.GATEWAY_SERIAL_NUMBER,
            'TempUnit': params.TEMPERATURE_UNIT,
        }
    },
    getThermostatLookupInfo: {
        path: '/GetTStatLookupInfo',
        paramsDef: {
            'gatewaysn': params.GATEWAY_SERIAL_NUMBER,
            'name': params.NAME
        }
    },
    getThermostatScheduleInfo: {
        path: '/GetTStatScheduleInfo',
        paramsDef: {
            'gatewaysn': params.GATEWAY_SERIAL_NUMBER
        }
    },
    getSystemsInfo: {
        path: '/GetSystemsInfo',
        paramsDef: {
            'UserId': params.USER_ID
        }
    },
    validateUser: {
        path: '/ValidateUser',
        paramsDef: {
            'UserName': params.USER_ID,
            'lang_nbr': params.LANGUAGE_NBR
        }
    }
};