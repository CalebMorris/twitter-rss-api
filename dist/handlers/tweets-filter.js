"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryKey = exports.FilterMode = void 0;
const lodash_1 = __importDefault(require("lodash"));
var FilterMode;
(function (FilterMode) {
    FilterMode["MEDIA"] = "MEDIA";
    FilterMode["NO_MEDIA"] = "NO_MEDIA";
    FilterMode["NO_OP"] = "NO_OP";
})(FilterMode = exports.FilterMode || (exports.FilterMode = {}));
exports.queryKey = 'filter_mode';
const NoOpFilterer = {
    doesPass: _ => true
};
class MediaFilterer {
    doesPass(tweet) {
        return this.hasMedia(tweet);
    }
    hasMedia(tweet) {
        var _a;
        if (!tweet)
            return false;
        return !!((_a = tweet === null || tweet === void 0 ? void 0 : tweet.extended_entities) === null || _a === void 0 ? void 0 : _a.media) || this.hasMedia(tweet === null || tweet === void 0 ? void 0 : tweet.in_reply_to_tweet);
    }
}
class NegationFilterer {
    constructor(innerFilterer) {
        this.innerFilterer = innerFilterer;
    }
    doesPass(tweet) {
        return !this.innerFilterer.doesPass(tweet);
    }
}
class TweetsFilter {
    static filterByMode(mode, tweets) {
        const filterInstance = TweetsFilter.filterMap[mode];
        return lodash_1.default.filter(tweets, filterInstance.doesPass.bind(filterInstance));
    }
    static filterByPossibleMode(possibleMode, tweets) {
        const ModeIndex = FilterMode;
        const enumVal = ModeIndex[possibleMode] || FilterMode.NO_OP;
        return TweetsFilter.filterByMode(enumVal, tweets);
    }
}
exports.default = TweetsFilter;
TweetsFilter.filterMap = {
    [FilterMode.MEDIA]: new MediaFilterer(),
    [FilterMode.NO_MEDIA]: new NegationFilterer(new MediaFilterer()),
    [FilterMode.NO_OP]: NoOpFilterer,
};
