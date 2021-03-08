import { validationSchema, handler as userHandler } from '../handlers/users';
import { Twitter } from 'twitter-app-api';
import { Lifecycle, Server, ServerRoute } from '@hapi/hapi';

export function route(twit: Twitter, server: Server): void {

  const handler: Lifecycle.Method = (r, h, e) => {
    return userHandler(twit, r, h);
  }

  const serverRoute: ServerRoute = {
    path : '/user/{screenName}',
    method : 'GET',
    options : {
      validate : validationSchema,
    },
    handler : handler,
  };

  return server.route(serverRoute);

}
