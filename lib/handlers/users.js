'use strict';

var _ = require('lodash');
var Joi = require('joi');
var Rss = require('rss');
var util = require('util');

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
    var matchResults = findall(text, /https?:\/\/[a-zA-Z0-9\-\.]+\/[A-z0-9_&?]*/g);
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
    description : 'Rss of tweets for the user \'' + screenName + '\'',
    generator : 'node-rss and twitter-rss-api',
    site_url: 'https://twitter.com/' + screenName,
  });

  _.map(tweets, function(tweet) {
    feed.item({
      title : tweet.text,
      description : formatTweet(tweet.text, format),
      url : util.format('https://twitter.com/%s/status/%s', tweet.user.screen_name, tweet.id_str),
      date : tweet.created_at,
      author : screenName
    });
  });

  return feed.xml();
}

function handler(twit, request, reply) {
  console.log('request path:', request.url.path);
  var options = { screen_name : request.params.screenName };

  var formatOption = request.query.format;
  delete request.query.format;

  for (var key in request.query) {
    options[key] = request.query[key];
  }

  return twit.getTweets(options)
  .then(function(tweets) {
    reply(
      generateRssFeed(request.params.screenName, null, null, tweets, formatOption)
    )
    .type('text/xml');
  })
  .catch(function(err) {
    if (err === false) {
      return reply().code(503);
    }
  });
}

module.exports = {
  handler : handler,

  findall : findall,

  formatTweet : formatTweet,

  generateRssFeed : generateRssFeed,

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
};
