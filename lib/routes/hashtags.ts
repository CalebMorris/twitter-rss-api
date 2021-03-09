import { validationSchema, handler as userHandler } from '../handlers/hashtags';
import { Twitter } from 'twitter-app-api';
import { Lifecycle, Server, ServerRoute } from '@hapi/hapi';

export function route(twit: Twitter, server: Server): void {

  const handler: Lifecycle.Method = (r, h, e) => {
    if (e) {
      console.error(e);
    }
    return userHandler(twit, r, h);
  }

  const serverRoute: ServerRoute = {
    path : '/hashtag/{hashTag}',
    method : 'GET',
    options : {
      validate : validationSchema,
    },
    handler : handler,
  };

  return server.route(serverRoute);

}
