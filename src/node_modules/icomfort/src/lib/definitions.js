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
    },
    setThermostatInfo: {
        path: '/SetTStatInfo',
        paramsDef: {
            'UserId': params.USER_ID,
            'GatewaySN': params.GATEWAY_SERIAL_NUMBER
        }
    },
    setHeatPoint: {
        path: '/Set_HeatPoint',
        paramsDef: {
            'UserId': params.USER_ID,
            'hidden_gateway_SN': params.GATEWAY_SERIAL_NUMBER,
            'zoneNumber': params.GATEWAY_SERIAL_NUMBER,
        }
    },
    setAwayMode: {
        path: '/SetAwayModeNew',
        paramsDef: {
            'awaymode': Number,//Enum (0,1)
            'coolsetpoint': Number,
            'fanmode': Number,//Enum (0,1)
            'gatewaysn': params.GATEWAY_SERIAL_NUMBER,
            'heatsetpoint': Number,
            'tempscale': Number,
            'zonenumber': params.ZONE_ID,
        }
    },
    setModeChange: {
        path: '/Set_ModeChange',
        paramsDef: {
            'hidden_gateway_SN': params.GATEWAY_SERIAL_NUMBER,
            'zoneNumber': params.ZONE_ID,
            'Current_HeatPoint': params.TEMPERATURE,
            'Current_CoolPoint': params.TEMPERATURE,
            'Current_FanValue': params.FAN_MODE,
            'Program_Schedule_Mode': params.PROGRAM_SCHEDULE_MODE,
            'Operation_Mode': params.OPERATION_MODE,
            'Program_Schedule_Selection': params.PROGRAM_SCHEDULE_ID,
            'Pref_Temp_Units': params.TEMPERATURE_UNIT,
        }
    },
};