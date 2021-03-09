'use strict';

import Hapi from '@hapi/hapi';
import { Twitter } from 'twitter-app-api';
import { routes } from './routes';

async function init() {

  if(! process.env.TWITTER_API_KEY) {
    console.error('TWITTER_API_KEY must be defind');
    process.exit(1);
  }

  if(! process.env.TWITTER_API_SECRET) {
    console.error('TWITTER_API_SECRET must be defind');
    process.exit(1);
  }

  console.log('Authenticating client against Twitter API v1.1');
  let twit;
  try {
    twit = await Twitter.authenticate(process.env.TWITTER_API_KEY, process.env.TWITTER_API_SECRET, { tweet_mode: 'extended' });
  } catch(err) {
    console.error(err.message);
    console.error(err.body);
    process.exit(2);
  }
  console.log('Authentication completed');

  const server = Hapi.server({
      port: process.env.PORT || 4000,
      host: '0.0.0.0'
  });

  routes(twit, server);

  await server.start();
  console.log('Server running on %s', server.info.uri);
}

function attachProcessHooks() {
  process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(7);
  });

  process.on('exit', code => {
    console.log(`Process exited with code: ${code}`)
  });

  process.on('SIGTERM', signal => {
    console.log(`Process ${process.pid} received a SIGTERM signal`)
    process.exit(0)
  })
  
  process.on('SIGINT', signal => {
    console.log(`Process ${process.pid} has been interrupted`)
    process.exit(0)
  })
}

attachProcessHooks();
init()
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
