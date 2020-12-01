const _ = require('lodash');

class TweetTransformer {
  static parse(tweet) {
    const parsedTweet = {
      UserName: tweet.user.screen_name,
      UserIcon: tweet.user.profile_image_url_https,
      DisplayName: tweet.user.name,
      ReplyingUserName: tweet.in_reply_to_screen_name,
      FullText: tweet.full_text,
      StatusId: tweet.id_str,
      StatusTimestamp: tweet.created_at,
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
    return parsedTweet;
  }
}

module.exports = TweetTransformer;