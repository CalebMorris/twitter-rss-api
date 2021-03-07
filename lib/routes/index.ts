import Hapi from '@hapi/hapi';
import { Twitter } from "twitter-app-api";
import { route as usersRoutes} from './users';
import { route as homeRoutes } from './home';

module.exports = function(twit: Twitter, server: Hapi.Server) {
  usersRoutes(twit, server);
  homeRoutes(server);
};
