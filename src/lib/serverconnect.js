var request = require("../node_modules/request-promise-native");
var url = require("url");

var iComfortServer = {
    url: {
        host: "services.myicomfort.com",
        port: "443",
        protocol: "https:",
    },
    basePath: "/DBAcessService.svc"
};

var getFullUri = function(endpoint) {
    return url.format(iComfortServer.url) + iComfortServer.basePath + endpoint;
};

module.exports = {
    doGet: function(path, params, auth) { return request.get(getFullUri(path), {auth: auth, json: true, qs: params}); },
    doPut: function(path, params, data, auth) { return request.put(getFullUri(path), {auth: auth, body: data, json: true, qs: params}); },
};
