'use strict';

var config  = require('../config').get('/twitter');
var Hapi    = require('@hapi/hapi');
var Twitter = require('twitter-app-api');

var twit = new Twitter(config.apiKey, config.apiSecret, { tweet_mode: 'extended' });

const init = async () => {

    const server = Hapi.server({
        port: process.env.PORT || 4000,
        host: '0.0.0.0'
    });

    require('./routes')(twit, server);

    await server.start();
    console.log('Server running on %s', server.info.uri);

    return twit.authenticate()
    .then(function(twit) {
      console.log('authenticated');
    })
    .catch(function(err) {
      console.error(err.message);
      console.error(err.body);
    });
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
