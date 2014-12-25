'use strict';

var _ = require('lodash');
var Joi = require('joi');
var Rss = require('rss');

function findall(str, regex) {
  var found;
  var matches = [];

  while(true) {
    found = regex.exec(str);
    if (! found) {
      break;
    }

    matches.push(found[0]);
  }

  return matches;
}

function formatTweet(text, option) {
  if(option === 'rss') {
    var matchResults = findall(text, /(?:https?:\/\/)?(?:[\da-z\.-]+)\.(?:[a-z\.]{2,6})(?:[\/\w \.-]*)*\/?/g);
    if (matchResults) {
      _.each(matchResults, function(match) {
        text = text.replace(match, '<a href="' + match + '">' + match + '</a>');
      });
    }
  }

  return text;
}

function generateRssFeed(screenName, path, query, tweets, format) {
  var feed = new Rss({
    title : 'Tweets of ' + screenName,
    description : 'Rss of tweets for the user \'' + screenName + '\''
  });

  _.map(tweets, function(tweet) {
    feed.item({
      title : tweet.text,
      description : formatTweet(tweet.text, format),
      url : tweet.expanded_url,
      date : tweet.created_at,
      author : screenName
    });
  });

  return feed.xml();
}

function route(twit, server) {

  return server.route({
    path : '/user/{screenName}',
    method : 'GET',
    config : {
      handler : function(request, reply) {
        var options = { screen_name : request.params.screenName };

        var formatOption = request.query.format;
        delete request.query.format;

        for (var key in request.query) {
          options[key] = request.query[key];
        }

        twit.getTweets(options)
        .then(function(tweets) {
          reply(
            generateRssFeed(request.params.screenName, null, null, tweets, formatOption)
          );
        })
        .catch(function(err) {
          if (err === false) {
            return reply().code(503);
          }
        });
      },
      validate : {
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
          include_rts         : Joi.boolean(),
          format : Joi.string().optional().min(1),
        }
      }
    }
  });

}

module.exports = route;
