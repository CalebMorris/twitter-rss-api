'use strict';

if(! process.env.TWITTER_API_KEY) {
  console.error('TWITTER_API_KEY must be defind');
  process.exit(1);
}

if(! process.env.TWITTER_API_SECRET) {
  console.error('TWITTER_API_SECRET must be defind');
  process.exit(1);
}

require('./lib/twitter-rss-api');
