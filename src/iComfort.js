'use strict';

global.auth = { username: "", password: "" }; // YOUR USERNAME AND PASSWORD FOR MYICOMFORT.COM GO HERE

const iComfort = new (require("icomfort"))(global.auth);

module.exports = iComfort;
