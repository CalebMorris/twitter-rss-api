import Hapi from '@hapi/hapi';

import { FilterMode, queryKey as filterModeKey } from '../handlers/tweets-filter';

const template = `
<html>
<body>
  <h3>Twitter RSS Shim</h3>
  <p> Test it out: <a href="/user/google?format=rss">here</a></p>
  <p></p>
  <div>
    <h4>Query param options</h4>
    <div><b>${filterModeKey}</b> - Filter tweets by a particular type. Modes: [${Object.values(FilterMode).map(x => `<b>${x}</b>`).join(', ')}]</div>
  </div>
</body>
<html>
`;

export function route(server: Hapi.Server): void {

  return server.route({
    path : '/',
    method : 'GET',
    handler : function(request, h) {
      return h.response(template).code(200);
    },
  });

}
