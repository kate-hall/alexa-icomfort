global.auth = {username: "", password: ""}; // YOUR USERNAME AND PASSWORD FOR MYICOMFORT.COM GO HERE

var s = require("./lib/serverconnect");
var m = require("./lib/servermethods");

module.exports = {
    getGatewayInfo: s.doGet.bind(s.doGet, m.getGatewayInfo.path),
    getSystemsInfo: s.doGet.bind(s.doGet, m.getSystemsInfo.path),
    getThermostatInfoList: s.doGet.bind(s.doGet, m.getThermostatInfoList.path),
    setThermostatInfo: (params, changes, auth) => s.doPut(m.setThermostatInfo.path, params, changes, auth)
};
