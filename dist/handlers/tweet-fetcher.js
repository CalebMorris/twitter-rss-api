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
const lodash_1 = __importDefault(require("lodash"));
class TweetFetcher {
    constructor(twit) {
        this.twit = twit;
    }
    getTweets(tweetIds, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const [cachedIds, uncachedIds] = lodash_1.default.partition(tweetIds, (tweetId) => {
                return tweetId in TweetFetcher.tweetRefCache;
            });
            const tweets = uncachedIds.length == 0 ? [] : yield this.twit.statuses.lookup(Object.assign({ id: uncachedIds.join(",") }, options));
            lodash_1.default.forEach(tweets, (tweet) => {
                TweetFetcher.tweetRefCache[tweet.id_str] = tweet;
            });
            return [
                ...tweets,
                ...(lodash_1.default.map(cachedIds, (cachedId) => {
                    return TweetFetcher.tweetRefCache[cachedId];
                })),
            ];
        });
    }
    getTimeline(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const tweets = yield this.twit.statuses.timeline(options);
            lodash_1.default.forEach(tweets, (tweet) => {
                TweetFetcher.tweetRefCache[tweet.id_str] = tweet;
            });
            return tweets;
        });
    }
}
exports.default = TweetFetcher;
TweetFetcher.tweetRefCache = {};
