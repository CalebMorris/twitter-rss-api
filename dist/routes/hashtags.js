"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const hashtags_1 = require("../handlers/hashtags");
function route(twit, server) {
    const handler = (r, h, e) => {
        if (e) {
            console.error(e);
        }
        return hashtags_1.handler(twit, r, h);
    };
    const serverRoute = {
        path: '/hashtag/{hashTag}',
        method: 'GET',
        options: {
            validate: hashtags_1.validationSchema,
        },
        handler: handler,
    };
    return server.route(serverRoute);
}
exports.route = route;
