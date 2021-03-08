"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const users_1 = require("./users");
const home_1 = require("./home");
function routes(twit, server) {
    users_1.route(twit, server);
    home_1.route(server);
}
exports.routes = routes;
