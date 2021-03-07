"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var users_1 = require("./users");
var home_1 = require("./home");
module.exports = function (twit, server) {
    users_1.route(twit, server);
    home_1.route(server);
};
