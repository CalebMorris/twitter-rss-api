'use strict';

var _ = require('lodash');
var Joi = require('@hapi/joi');
var Rss = require('rss');
var util = require('util');
var STATUS_TMPL = 'https://twitter.com/%s/status/%s';
const TweetFormatter = require('../view/TweetFormatter');

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
      description : TweetFormatter.render(tweet),
      url : util.format(STATUS_TMPL, tweet.user.screen_name, tweet.id_str),
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

async function handler(twit, request, h) {
  try {
    console.log(`Requested URL [${request.raw.req.url}]`);
    var options = { screen_name : request.params.screenName };

    const formatOption = request.query.format;
    delete request.query.format;

    for (var key in request.query) {
      options[key] = request.query[key];
    }

    const tweets = await twit.statuses.timeline(options);

    return h.response(
      generateRssFeed(request.params.screenName, null, null, tweets, formatOption)
    )
    .type('text/xml');
  } catch(err) {
    console.error(err);
    if (err === false) {
      return h.response().code(503);
    }
  }
}

module.exports = {
  handler : handler,

  findall : findall,

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
