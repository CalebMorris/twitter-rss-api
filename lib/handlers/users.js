'use strict';

var _ = require('lodash');
var Joi = require('@hapi/joi');
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
    const itemOptions = {
      title : tweet.full_text,
      description : formatTweet(tweet.full_text, format),
      url : util.format('https://twitter.com/%s/status/%s', tweet.user.screen_name, tweet.id_str),
      date : tweet.created_at,
      author : screenName
    };
    if (tweet.entities) {
      if (tweet.entities.media) {
        _.each(tweet.entities.media, (item, index) => {
          if (item && item.media_url_https) {
            itemOptions.enclosure = {
              url: item.media_url_https,
            };
          }
        });
      }
    }
    feed.item(itemOptions);
  });

  return feed.xml();
}

function handler(twit, request, h) {
  var formatOption;
  return new Promise(function(resolve, reject) {
    console.log(`Requested URL [${request.raw.req.url}]`);
    var options = { screen_name : request.params.screenName };

    formatOption = request.query.format;
    delete request.query.format;

    for (var key in request.query) {
      options[key] = request.query[key];
    }

    return resolve(options);
  }).then(function(options) {
    return twit.statuses.timeline(options);
  }).then(function(tweets) {
    return h.response(
      generateRssFeed(request.params.screenName, null, null, tweets, formatOption)
    )
    .type('text/xml');
  })
  .catch(function(err) {
    console.error(err);
    if (err === false) {
      return h.response().code(503);
    }
  });
}

module.exports = {
  handler : handler,

  findall : findall,

  formatTweet : formatTweet,

  generateRssFeed : generateRssFeed,

  validate : {
    params : Joi.object({
      screenName : Joi.string().min(1).required()
    }),
    query : Joi.object({
      user_id             : Joi.number().integer().min(0),
      since_id            : Joi.number().integer().min(0),
      count               : Joi.number().integer().min(0),
      max_id              : Joi.number().integer().min(0),
      trim_user           : Joi.boolean(),
      exclude_replies     : Joi.boolean(),
      contributor_details : Joi.boolean(),
      include_rts         : Joi.boolean(),
      format : Joi.string().optional().min(1),
    }),
  },
};
