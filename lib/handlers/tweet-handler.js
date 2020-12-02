
const _ = require('lodash');

class TweetHandler {
  static tweetRefCache = {};

  constructor(twit) {
    this.twit = twit;
  }

  async getTweets(tweetIds, options) {
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

  async getTimeline(options) {
    const tweets = await this.twit.statuses.timeline(options);
    _.forEach(tweets, (tweet) => {
      this.tweetRefCache[tweet.id_str] = tweet;
    });
    return tweets;
  }

}

module.exports = TweetHandler;