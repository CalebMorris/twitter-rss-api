
import _ from 'lodash';
import { Twitter } from 'twitter-app-api';
import { TimelineOptions, TimelineResults } from 'twitter-app-api/dist/actions/statuses/timeline';
import { Status as Tweet } from 'twitter-d';

export default class TweetHandler {
  static tweetRefCache: { [key: string]: Tweet } = {};

  twit: Twitter;

  constructor(twit: Twitter) {
    this.twit = twit;
  }

  async getTweets(tweetIds: string[], options: any = {}): Promise<Array<Tweet>> {
    const [cachedIds, uncachedIds] = _.partition(tweetIds, (tweetId) => {
      return tweetId in TweetHandler.tweetRefCache;
    });

    const tweets = uncachedIds.length == 0 ? [] : await this.twit.statuses.lookup({
      id: uncachedIds.join(","),
      ...options,
    })

    _.forEach(tweets, (tweet) => {
      TweetHandler.tweetRefCache[tweet.id_str] = tweet;
    });

    return [
      ...tweets,
      ...(_.map(cachedIds, (cachedId) => {
        return TweetHandler.tweetRefCache[cachedId];
      })),
    ];
  }

  async getTimeline(options: TimelineOptions): Promise<TimelineResults> {
    const tweets = await this.twit.statuses.timeline(options);
    _.forEach(tweets, (tweet) => {
      TweetHandler.tweetRefCache[tweet.id_str] = tweet;
    });
    return tweets;
  }

}
