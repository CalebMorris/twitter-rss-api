"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const users_1 = require("../handlers/users");
function route(twit, server) {
    const handler = (r, h, e) => {
        return users_1.handler(twit, r, h);
    };
    const serverRoute = {
        path: '/user/{screenName}',
        method: 'GET',
        options: {
            validate: users_1.validationSchema,
        },
        handler: handler,
    };
    return server.route(serverRoute);
}
exports.route = route;
