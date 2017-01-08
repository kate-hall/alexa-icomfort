var params = require("./params");

module.exports = {
    getGatewayInfo: {
        path: "/GetGatewayInfo",
        paramsDef: {
            "GatewaySN": params.GATEWAY_SERIAL_NUMBER,
            "TempUnit": params.TEMPERATURE_UNIT
        }
    },
    getThermostatInfoList: {
        path: "/GetTStatInfoList",
        paramsDef: {
            "Cancel_Away": params.CANCEL_AWAY_FLAG,
            "GatewaySN": params.GATEWAY_SERIAL_NUMBER,
            "TempUnit": params.TEMPERATURE_UNIT
        }
    },
    getSystemsInfo: {
        path: "/GetSystemsInfo",
        paramsDef: {
            "UserId": params.USER_ID
        }
    },
    setThermostatInfo: {
        path: "/SetTStatInfo",
        paramsDef: {
            "UserId": params.USER_ID,
            "GatewaySN": params.GATEWAY_SERIAL_NUMBER
        }
    }
};
