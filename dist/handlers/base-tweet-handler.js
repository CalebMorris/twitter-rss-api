"use strict";
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
exports.baseHandler = void 0;
const lodash_1 = __importDefault(require("lodash"));
const tweet_fetcher_1 = __importDefault(require("./tweet-fetcher"));
function baseHandler(twit, tweetsSupplier) {
    return __awaiter(this, void 0, void 0, function* () {
        const tweetHandler = new tweet_fetcher_1.default(twit);
        let tweets = yield tweetsSupplier.getTweets();
        const innerTweetIds = lodash_1.default.reduce(tweets, (curry, timelineTweet) => {
            if (timelineTweet.in_reply_to_status_id_str)
                curry.push(timelineTweet.in_reply_to_status_id_str);
            return curry;
        }, []);
        const innerTweets = yield tweetHandler.getTweets(innerTweetIds);
        const innerTweetsMap = lodash_1.default.reduce(innerTweets, (curry, innerTweet) => {
            curry[innerTweet.id_str] = innerTweet;
            return curry;
        }, {});
        tweets = lodash_1.default.map(tweets, (timelineTweet) => {
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
        return tweets;
    });
}
exports.baseHandler = baseHandler;
