import _ from 'lodash';
import Joi from 'joi';
import Rss from 'rss';
import util from 'util';
import TweetFormatter from '../view/TweetFormatter';
import Hapi, { RouteOptionsValidate } from '@hapi/hapi';
import { Twitter } from "twitter-app-api";
import { FullUser, Status as Tweet } from 'twitter-d';
import { ExtendedTweet } from '../shared-types/enteded-tweet';
import TweetsFilter, { FilterMode, queryKey as filterModeKey } from './tweets-filter';
import { baseHandler } from './base-tweet-handler';

const STATUS_TMPL = 'https://twitter.com/%s/status/%s';

function generateRssFeed(screenName: string, tweets: Array<Tweet>): string {
  const feed = new Rss({
    title : `Tweets of ${screenName}`,
    description : `Rss of tweets for the user '${screenName}'`,
    generator : 'node-rss and twitter-rss-api',
    site_url: `https://twitter.com/${screenName}`,
    feed_url: '', // TODO: fill this in
  });

  _.map(tweets, function(tweet) {
    const itemOptions: any = {
      title : tweet.full_text,
      description : TweetFormatter.render(tweet),
      url : util.format(STATUS_TMPL, (tweet.user as FullUser).screen_name, tweet.id_str),
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

export async function handler(twit: Twitter, request: Hapi.Request, h: Hapi.ResponseToolkit) {
  try {
    console.log(`Requested URL [${request.raw.req.url}]`);

    const options: any = { screen_name : request.params.screenName };

    delete request.query.format;

    for (const key in request.query) {
      options[key] = request.query[key];
    }

    let timelineTweets = await baseHandler(
      twit,
      {
          getTweets: async () => {
          return (await twit.statuses.timeline({
            screen_name : request.params.screenName,
            ...options,
          })).map(x => x as ExtendedTweet);
        }
      }
    )

    timelineTweets = TweetsFilter.filterByPossibleMode(options[filterModeKey], timelineTweets);

    return h.response(
      generateRssFeed(request.params.screenName, timelineTweets)
    )
    .type('text/xml');
  } catch(err) {
    console.error(err);
    if (err === false) {
      return h.response().code(503);
    }
  }
}

const paramsSchema = Joi.object({
  screenName : Joi.string().min(1).required()
});

const querySchema = Joi.object({
  user_id             : Joi.number().integer().min(0),
  since_id            : Joi.number().integer().min(0),
  count               : Joi.number().integer().min(0),
  max_id              : Joi.number().integer().min(0),
  trim_user           : Joi.boolean(),
  exclude_replies     : Joi.boolean(),
  contributor_details : Joi.boolean(),
  include_rts         : Joi.boolean(),
  format : Joi.string().optional().min(1),
  [filterModeKey]: Joi.string().valid(...Object.values(FilterMode))
});

export const validationSchema: RouteOptionsValidate = {
  params : paramsSchema,
  query : querySchema,
};
