"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = exports.handler = void 0;
const lodash_1 = __importDefault(require("lodash"));
const joi_1 = __importDefault(require("joi"));
const rss_1 = __importDefault(require("rss"));
const util_1 = __importDefault(require("util"));
const TweetFormatter_1 = __importDefault(require("../view/TweetFormatter"));
const tweet_handler_1 = __importDefault(require("../handlers/tweet-handler"));
const tweets_filter_1 = __importStar(require("./tweets-filter"));
const STATUS_TMPL = 'https://twitter.com/%s/status/%s';
function generateRssFeed(screenName, tweets) {
    const feed = new rss_1.default({
        title: `Tweets of ${screenName}`,
        description: `Rss of tweets for the user '${screenName}'`,
        generator: 'node-rss and twitter-rss-api',
        site_url: `https://twitter.com/${screenName}`,
        feed_url: '', // TODO: fill this in
    });
    lodash_1.default.map(tweets, function (tweet) {
        const itemOptions = {
            title: tweet.full_text,
            description: TweetFormatter_1.default.render(tweet),
            url: util_1.default.format(STATUS_TMPL, tweet.user.screen_name, tweet.id_str),
            date: tweet.created_at,
            author: screenName
        };
        if (tweet.entities) {
            if (tweet.entities.media) {
                lodash_1.default.each(tweet.entities.media, (item, index) => {
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
function handler(twit, request, h) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Requested URL [${request.raw.req.url}]`);
            const tweetHandler = new tweet_handler_1.default(twit);
            const options = { screen_name: request.params.screenName };
            delete request.query.format;
            for (const key in request.query) {
                options[key] = request.query[key];
            }
            let timelineTweets = (yield twit.statuses.timeline(Object.assign({ screen_name: request.params.screenName }, options))).map(x => x);
            const innerTweetIds = lodash_1.default.reduce(timelineTweets, (curry, timelineTweet) => {
                if (timelineTweet.in_reply_to_status_id_str)
                    curry.push(timelineTweet.in_reply_to_status_id_str);
                return curry;
            }, []);
            const innerTweets = yield tweetHandler.getTweets(innerTweetIds);
            const innerTweetsMap = lodash_1.default.reduce(innerTweets, (curry, innerTweet) => {
                curry[innerTweet.id_str] = innerTweet;
                return curry;
            }, {});
            timelineTweets = lodash_1.default.map(timelineTweets, (timelineTweet) => {
                let tweet = timelineTweet;
                if (tweet.retweeted_status) {
                    tweet = tweet.retweeted_status;
                    tweet.retweetUser = timelineTweet.user;
                }
                if (tweet.in_reply_to_status_id_str) {
                    tweet.in_reply_to_tweet = innerTweetsMap[tweet.in_reply_to_status_id_str];
                }
                return tweet;
            });
            timelineTweets = tweets_filter_1.default.filterByPossibleMode(options[tweets_filter_1.queryKey], timelineTweets);
            return h.response(generateRssFeed(request.params.screenName, timelineTweets))
                .type('text/xml');
        }
        catch (err) {
            console.error(err);
            if (err === false) {
                return h.response().code(503);
            }
        }
    });
}
exports.handler = handler;
const paramsSchema = joi_1.default.object({
    screenName: joi_1.default.string().min(1).required()
});
const querySchema = joi_1.default.object({
    user_id: joi_1.default.number().integer().min(0),
    since_id: joi_1.default.number().integer().min(0),
    count: joi_1.default.number().integer().min(0),
    max_id: joi_1.default.number().integer().min(0),
    trim_user: joi_1.default.boolean(),
    exclude_replies: joi_1.default.boolean(),
    contributor_details: joi_1.default.boolean(),
    include_rts: joi_1.default.boolean(),
    format: joi_1.default.string().optional().min(1),
    [tweets_filter_1.queryKey]: joi_1.default.string().valid(...Object.values(tweets_filter_1.FilterMode))
});
exports.validationSchema = {
    params: paramsSchema,
    query: querySchema,
};
