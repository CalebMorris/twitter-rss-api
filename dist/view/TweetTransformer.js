"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
class TweetTransformer {
    static parse(tweet) {
        const fullUser = tweet.user;
        const parsedTweet = {
            UserName: fullUser.screen_name,
            UserIcon: fullUser.profile_image_url_https,
            DisplayName: fullUser.name,
            ReplyingUserName: tweet.in_reply_to_screen_name,
            FullText: tweet.full_text,
            StatusId: tweet.id_str,
            StatusTimestamp: tweet.created_at,
            RetweetUser: tweet.retweetUser,
            MediaItems: lodash_1.default.map(tweet && tweet.extended_entities && tweet.extended_entities.media, (mediaItem) => {
                return {
                    MediaPhoto: mediaItem.type == 'photo' && {
                        url: mediaItem.media_url_https,
                    },
                    MediaVideo: mediaItem.type == 'video' && {
                        sources: lodash_1.default.map(mediaItem.video_info && mediaItem.video_info.variants, (variant) => {
                            return {
                                url: variant.url,
                                contentType: variant.content_type,
                                poster: mediaItem.media_url_https,
                            };
                        }),
                    },
                    MediaAnimatedGif: mediaItem.type == 'animated_gif' && {
                        sources: lodash_1.default.map(mediaItem.video_info && mediaItem.video_info.variants, (variant) => {
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
exports.default = TweetTransformer;
