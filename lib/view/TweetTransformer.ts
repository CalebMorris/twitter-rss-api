import _ from 'lodash';
import { FullUser, Status as Tweet, User } from 'twitter-d';

export interface ExtendedTweet extends Tweet {
  retweetUser: User,
  in_reply_to_tweet: ExtendedTweet,
}

export default class TweetTransformer {
  static parse(tweet: ExtendedTweet) {
    const fullUser: FullUser = tweet.user as FullUser;
    const parsedTweet: any = {
      UserName: fullUser.screen_name,
      UserIcon: fullUser.profile_image_url_https,
      DisplayName: fullUser.name,
      ReplyingUserName: tweet.in_reply_to_screen_name,
      FullText: tweet.full_text,
      StatusId: tweet.id_str,
      StatusTimestamp: tweet.created_at,
      RetweetUser: tweet.retweetUser,
      MediaItems: _.map(
        tweet && tweet.extended_entities && tweet.extended_entities.media,
        (mediaItem) => {
          return {
            MediaPhoto: mediaItem.type == 'photo' && {
              url: mediaItem.media_url_https,
            },
            MediaVideo: mediaItem.type == 'video' && {
              sources: _.map(mediaItem.video_info && mediaItem.video_info.variants, (variant) => {
                return {
                  url: variant.url,
                  contentType: variant.content_type,
                  poster: mediaItem.media_url_https,
                };
              }),
            },
            MediaAnimatedGif: mediaItem.type == 'animated_gif' && {
              sources: _.map(mediaItem.video_info && mediaItem.video_info.variants, (variant) => {
                return {
                  url: variant.url,
                  contentType: variant.content_type,
                  poster: mediaItem.media_url_https,
                };
              }),
            },
          };
        })
    };
    if (tweet.in_reply_to_tweet) {
      parsedTweet.InReplyToTweet = TweetTransformer.parse(tweet.in_reply_to_tweet);
    }
    return parsedTweet;
  }
}
