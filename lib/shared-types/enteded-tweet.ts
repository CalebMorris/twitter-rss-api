import { Status as Tweet, User } from 'twitter-d';

export interface ExtendedTweet extends Tweet {
  retweetUser: User,
  in_reply_to_tweet: ExtendedTweet,
}