"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const tweets_filter_1 = require("../handlers/tweets-filter");
const template = `
<html>
<body>
  <h3>Twitter RSS Shim</h3>
  <p> Test it out: <a href="/user/google?format=rss">here</a></p>
  <p></p>
  <div>
    <h4>Query param options</h4>
    <div><b>${tweets_filter_1.queryKey}</b> - Filter tweets by a particular type. Modes: [${Object.values(tweets_filter_1.FilterMode).map(x => `<b>${x}</b>`).join(', ')}]</div>
  </div>
</body>
<html>
`;
function route(server) {
    return server.route({
        path: '/',
        method: 'GET',
        handler: function (request, h) {
            return h.response(template).code(200);
        },
    });
}
exports.route = route;
