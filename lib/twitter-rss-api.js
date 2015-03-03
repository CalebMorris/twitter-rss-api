'use strict';

var config  = require('../config').get('/twitter');
var hapi    = require('hapi');
var Twitter = require('twitter-app-api');

var twit = new Twitter(config.apiKey, config.apiSecret);

var server = new hapi.Server(process.env.PORT || 4000, '0.0.0.0');

require('./routes')(twit, server);

server.start(function() {
  console.log('Hapi server started @', server.info.uri);

  twit.authenticate()
  .then(function(twit) {
    console.log('authenticated');
  })
  .catch(function(err) {
    console.error(err.message);
    console.error(err.body);
  });
});
