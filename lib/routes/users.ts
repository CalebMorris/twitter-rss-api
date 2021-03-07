import users from '../handlers/users';
import { Twitter } from 'twitter-app-api';
import { Lifecycle, Server, ServerRoute } from '@hapi/hapi';

export function route(twit: Twitter, server: Server) {

  const handler: Lifecycle.Method = (r, h, e) => {
    return users.handler(twit, r, h);
  }

  const serverRoute: ServerRoute = {
    path : '/user/{screenName}',
    method : 'GET',
    options : {
      validate : users.validate,
    },
    handler : handler,
  };

  return server.route(serverRoute);

}
