import _ from 'lodash';
import { Entities, FullUser, HashtagEntity, UrlEntity, UserMentionEntity } from 'twitter-d';
import { ExtendedTweet } from '../shared-types/enteded-tweet';
import { encode } from 'html-entities';

export default class TweetTransformer {
  static parse(tweet: ExtendedTweet) {
    const fullUser: FullUser = tweet.user as FullUser;
    const parsedTweet: any = {
      UserName: fullUser.screen_name,
      UserIcon: fullUser.profile_image_url_https,
      DisplayName: fullUser.name,
      ReplyingUserName: tweet.in_reply_to_screen_name,
      FullText: this.enrichText(tweet.full_text, tweet.entities),
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

  static enrichText(text: string, entities: Entities): string {

    /*
     * In order for us to enrich the text content we first need to encode the text to prevent any HTML content
     *  already in the tweet from being embedded accidentally.
     * This means that the rendering engine needs to not HTML encode the text as well.
     */
    text = encode(text);

    if (entities?.user_mentions?.length) {
      _.each(entities.user_mentions, (userMention: UserMentionEntity) => {
        text = text.replace(`@${userMention.screen_name}`, `<a href="https://twitter.com/${userMention.screen_name}">@${userMention.screen_name}</a>`);
      });
    }
    if (entities?.hashtags?.length) {
      _.each(entities.hashtags, (hashtag: HashtagEntity) => {
        text = text.replace(`#${hashtag.text}`, `<a href="https://twitter.com/hashtag/${hashtag.text}">#${hashtag.text}</a>`);
      });
    }
    if (entities?.urls?.length) {
      _.each(entities.urls, (urlEntity: UrlEntity) => {
        text = text.replace(urlEntity.url, `<a href="${urlEntity.expanded_url}">${urlEntity.display_url}</a>`);
      });
    }
    return text;
  }
}
