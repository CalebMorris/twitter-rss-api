import Hapi from '@hapi/hapi';
import { Twitter } from "twitter-app-api";
import { route as usersRoutes} from './users';
import { route as homeRoutes } from './home';

export function routes(twit: Twitter, server: Hapi.Server): void {
  usersRoutes(twit, server);
  homeRoutes(server);
}
