'use strict';

var config  = require('./config').get('/twitter');
var hapi    = require('hapi');
var Joi     = require('joi');
var Twitter = require('twitter-app-api');

new Twitter(config.apiKey, config.apiSecret, function(twit) {

  var server = new hapi.Server(4000, 'localhost');

  server.route({
    path: "/user/{screenName}",
    method: "GET",
    config: {
      handler: function(request, reply) {
        var options = { screen_name : request.params.screenName };

        for (var key in request.query) {
          options[key] = request.query[key];
        }

        twit.getTweets(options, function(tweets) {
          reply({ length : tweets.length , tweets : tweets });
        });
        // console.log(request.params);
        // console.log(request.query);
      },
      validate: {
        params : {
          screenName : Joi.string().min(1).required()
        },
        query : {
          user_id             : Joi.number().integer().min(0),
          since_id            : Joi.number().integer().min(0),
          count               : Joi.number().integer().min(0),
          max_id              : Joi.number().integer().min(0),
          trim_user           : Joi.boolean(),
          exclude_replies     : Joi.boolean(),
          contributor_details : Joi.boolean(),
          include_rts         : Joi.boolean()
        }
      }
    }
  });

  server.start(function() {
    console.log('Hapi server started @', server.info.uri);
  });

});