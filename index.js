'use strict';

var _       = require('lodash');
var config  = require('./config').get('/twitter');
var hapi    = require('hapi');
var Joi     = require('joi');
var Rss     = require('rss');
var Twitter = require('twitter-app-api');

var generateRssFeed = function(screenName, path, query, tweets) {
  var feed = new Rss({
    title: 'Tweets of ' + screenName,
    description: 'Rss of tweets for the user \'' + screenName + '\''
  });

  _.map(tweets, function(tweet) {
    feed.item({
      title: tweet.text,
      description: tweet.text,
      url: tweet.expanded_url,
      date: tweet.created_at,
      author: screenName
    });
  });

  return feed.xml();
};

new Twitter(config.apiKey, config.apiSecret, function(err, twit) {
  if (err) {
    console.error(err.message);
    console.error(err.body);
  }

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
          reply(generateRssFeed(request.params.screenName, null, null, tweets));
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