'use strict';

const request = require('request-promise-native');
const url = require('url');

const ICOMFORT = {
    url: {
        host: 'services.myicomfort.com',
        port: '443',
        protocol: 'https:',
    },
    basePath: '/DBAcessService.svc'
};

const getFullUri = endpoint => url.format(ICOMFORT.url)+ICOMFORT.basePath+endpoint;

module.exports = {
    getFullUri,
    doGet: (path, params, auth) => request.get(getFullUri(path), {auth, json: true, qs: params}),
    doPut: (path, params, data, auth) => request.put(getFullUri(path), {auth, body: data, json: true, qs: params}),
};