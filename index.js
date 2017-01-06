'use strict';

const base = require('./src/lib/base');

const definitions = require('./src/lib/definitions');

module.exports = {
    getBuildingsInfo: base.doGet.bind(base.doGet, definitions.getBuildingsInfo.path),
    getGatewayInfo: base.doGet.bind(base.doGet, definitions.getGatewayInfo.path),
    getGatewaysAlerts: base.doGet.bind(base.doGet, definitions.getGatewaysAlerts.path),
    getSystemsInfo: base.doGet.bind(base.doGet, definitions.getSystemsInfo.path),
    getThermostatInfoList: base.doGet.bind(base.doGet, definitions.getThermostatInfoList.path),
    getThermostatLookupInfo: base.doGet.bind(base.doGet, definitions.getThermostatLookupInfo.path),
    getThermostatScheduleInfo: base.doGet.bind(base.doGet, definitions.getThermostatScheduleInfo.path),
    validateUser: (params, auth) => base.doPut(definitions.validateUser.path, params, '', auth),
};