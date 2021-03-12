import _ from "lodash";
import TweetFetcher from "./tweet-fetcher";
import { Twitter } from "twitter-app-api";
import { ExtendedTweet } from "../shared-types/enteded-tweet";
import { Status as Tweet } from 'twitter-d';

export interface TweetsSupplier {
  getTweets(): Promise<ExtendedTweet[]>
}

export async function baseHandler(twit: Twitter, tweetsSupplier: TweetsSupplier): Promise<ExtendedTweet[]> {
  const tweetHandler = new TweetFetcher(twit);

  let tweets: ExtendedTweet[] = await tweetsSupplier.getTweets();

  const innerTweetIds = _.reduce(tweets, (curry: string[], timelineTweet: Tweet) => {
    if (timelineTweet.in_reply_to_status_id_str) curry.push(timelineTweet.in_reply_to_status_id_str);
    return curry;
  }, []);

  const innerTweets = await tweetHandler.getTweets(innerTweetIds);
  const innerTweetsMap = _.reduce(innerTweets, (curry: {[key: string]: Tweet}, innerTweet: Tweet) => {
    curry[innerTweet.id_str] = innerTweet;
    return curry;
  }, {});

  tweets = _.map(tweets, (timelineTweet) => {
    let tweet: ExtendedTweet = timelineTweet as ExtendedTweet;
    if (tweet.retweeted_status) {
      tweet = tweet.retweeted_status as ExtendedTweet;
      tweet.retweetUser = timelineTweet.user;
    }
    if (tweet.in_reply_to_status_id_str) {
      tweet.in_reply_to_tweet = innerTweetsMap[tweet.in_reply_to_status_id_str] as ExtendedTweet;
    }
    return tweet;
  });

  return tweets;
}