"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const html_entities_1 = require("html-entities");
class TweetTransformer {
    static parse(tweet) {
        const fullUser = tweet.user;
        const parsedTweet = {
            UserName: fullUser.screen_name,
            UserIcon: fullUser.profile_image_url_https,
            DisplayName: fullUser.name,
            ReplyingUserName: tweet.in_reply_to_screen_name,
            FullText: this.enrichText(tweet.full_text, tweet.entities),
            StatusId: tweet.id_str,
            StatusTimestamp: tweet.created_at,
            RetweetUser: tweet.retweetUser,
            MediaItems: lodash_1.default.map(tweet && tweet.extended_entities && tweet.extended_entities.media, (mediaItem) => {
                var _a, _b, _c, _d;
                return {
                    MediaPhoto: mediaItem.type == 'photo' && {
                        url: mediaItem.media_url_https,
                    },
                    MediaVideo: mediaItem.type == 'video' && {
                        sources: lodash_1.default.map((_b = (_a = mediaItem === null || mediaItem === void 0 ? void 0 : mediaItem.video_info) === null || _a === void 0 ? void 0 : _a.variants) === null || _b === void 0 ? void 0 : _b.sort(TweetTransformer.sortVideoCompare), (variant) => {
                            return {
                                url: variant.url,
                                contentType: variant.content_type,
                                poster: mediaItem.media_url_https,
                            };
                        }),
                    },
                    MediaAnimatedGif: mediaItem.type == 'animated_gif' && {
                        sources: lodash_1.default.map((_d = (_c = mediaItem === null || mediaItem === void 0 ? void 0 : mediaItem.video_info) === null || _c === void 0 ? void 0 : _c.variants) === null || _d === void 0 ? void 0 : _d.sort(TweetTransformer.sortVideoCompare), (variant) => {
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
    static sortVideoCompare(left, right) {
        var _a, _b;
        return ((_a = left === null || left === void 0 ? void 0 : left.bitrate) !== null && _a !== void 0 ? _a : -Infinity) > ((_b = right === null || right === void 0 ? void 0 : right.bitrate) !== null && _b !== void 0 ? _b : -Infinity) ? 1 : -1;
    }
    static enrichText(text, entities) {
        var _a, _b, _c;
        /*
         * In order for us to enrich the text content we first need to encode the text to prevent any HTML content
         *  already in the tweet from being embedded accidentally.
         * This means that the rendering engine needs to not HTML encode the text as well.
         */
        text = html_entities_1.encode(text);
        if ((_a = entities === null || entities === void 0 ? void 0 : entities.user_mentions) === null || _a === void 0 ? void 0 : _a.length) {
            lodash_1.default.each(entities.user_mentions, (userMention) => {
                text = text.replace(`@${userMention.screen_name}`, `<a href="https://twitter.com/${userMention.screen_name}">@${userMention.screen_name}</a>`);
            });
        }
        if ((_b = entities === null || entities === void 0 ? void 0 : entities.hashtags) === null || _b === void 0 ? void 0 : _b.length) {
            lodash_1.default.each(entities.hashtags, (hashtag) => {
                text = text.replace(`#${hashtag.text}`, `<a href="https://twitter.com/hashtag/${hashtag.text}">#${hashtag.text}</a>`);
            });
        }
        if ((_c = entities === null || entities === void 0 ? void 0 : entities.urls) === null || _c === void 0 ? void 0 : _c.length) {
            lodash_1.default.each(entities.urls, (urlEntity) => {
                text = text.replace(urlEntity.url, `<a href="${urlEntity.expanded_url}">${urlEntity.display_url}</a>`);
            });
        }
        return text;
    }
}
exports.default = TweetTransformer;
