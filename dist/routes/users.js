"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
var users_1 = __importDefault(require("../handlers/users"));
function route(twit, server) {
    var handler = function (r, h, e) {
        return users_1.default.handler(twit, r, h);
    };
    var serverRoute = {
        path: '/user/{screenName}',
        method: 'GET',
        options: {
            validate: users_1.default.validate,
        },
        handler: handler,
    };
    return server.route(serverRoute);
}
exports.route = route;
