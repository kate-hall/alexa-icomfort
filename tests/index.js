'use strict';

const icomfort = require('../index');
const ENV = {
    USERNAME: process.env['ICOMFORT_USERNAME'],
    PASSWORD: process.env['ICOMFORT_PASSWORD'],
    GATEWAY_SN: process.env['ICOMFORT_GATEWAY_SERIAL'],
};
const auth = {username: ENV.USERNAME, password: ENV.PASSWORD};

const getBuildingsInfoParams = {UserId:ENV.USERNAME};
icomfort.getBuildingsInfo(getBuildingsInfoParams, auth)
    .then(console.log)
    .catch(console.error);

const getGatewayInfoParams = {GatewaySN:ENV.GATEWAY_SN, TempUnit: 0};
icomfort.getGatewayInfo(getGatewayInfoParams, auth)
    .then(console.log)
    .catch(console.error);

const getGatewaysAlertsParams = {gatewaysn:ENV.GATEWAY_SN};
icomfort.getGatewaysAlerts(getGatewaysAlertsParams, auth)
    .then(console.log)
    .catch(console.error);

const getSystemsInfoParams = {UserId:ENV.USERNAME};
icomfort.getSystemsInfo(getSystemsInfoParams, auth)
    .then(console.log)
    .catch(console.error);

const getThermostatInfoListParams = {GatewaySN:ENV.GATEWAY_SN, TempUnit: 0};
icomfort.getThermostatInfoList(getThermostatInfoListParams, auth)
    .then(console.log)
    .catch(console.error);

const getThermostatLookupInfoParams = {gatewaysn:ENV.GATEWAY_SN, name: 'all'};
icomfort.getThermostatLookupInfo(getThermostatLookupInfoParams, auth)
    .then(console.log)
    .catch(console.error);

const getThermostatScheduleInfoParams = {gatewaysn:ENV.GATEWAY_SN};
icomfort.getThermostatScheduleInfo(getThermostatScheduleInfoParams, auth)
    .then(console.log)
    .catch(console.error);

const validateUserData = {UserName:ENV.USERNAME,lang_nbr:0};
icomfort.validateUser(validateUserData, auth)
    .then(console.log)
    .catch(console.error);
