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

function generateRssFeed(hashTag: string, tweets: Array<Tweet>, feedUrl: string): string {
  const feed = new Rss({
    title : `Tweets of #${hashTag}`,
    description : `Rss of tweets for the hashtag '#${hashTag}'`,
    generator : 'node-rss and twitter-rss-api',
    site_url: `https://twitter.com/hashtag/${hashTag}`,
    feed_url: feedUrl,
  });

  _.map(tweets, function(tweet) {
    const itemOptions: any = {
      title : tweet.full_text,
      description : TweetFormatter.render(tweet),
      url : util.format(STATUS_TMPL, (tweet.user as FullUser).screen_name, tweet.id_str),
      date : tweet.created_at,
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

    const options: any = {
      hashTag: request.params.hashTag,
      ...request.query,
    };

    let timelineTweets = await baseHandler(
      twit,
      {
          getTweets: async () => {
          return (await twit.search.tweets({
            q : `#${options.hashTag}`,
            ...options,
          }))?.statuses?.map(x => x as ExtendedTweet);
        }
      }
    )

    timelineTweets = TweetsFilter.filterByPossibleMode(options[filterModeKey], timelineTweets);

    return h.response(
      generateRssFeed(request.params.hashTag, timelineTweets, request.url.toString())
    )
    .type('text/xml');
  } catch(err) {
    console.error(err);
    if (err === false) {
      return h.response().code(503);
    }
  }
}

export const validationSchema: RouteOptionsValidate = {
  params : Joi.object({
    hashTag : Joi.string().min(1).required()
  }),
  query : Joi.object({
    [filterModeKey]: Joi.string().valid(...Object.values(FilterMode))
  }),
};
