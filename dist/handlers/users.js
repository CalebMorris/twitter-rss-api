"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var joi_1 = __importDefault(require("@hapi/joi"));
var rss_1 = __importDefault(require("rss"));
var util_1 = __importDefault(require("util"));
var TweetFormatter_1 = __importDefault(require("../view/TweetFormatter"));
var tweet_handler_1 = __importDefault(require("../handlers/tweet-handler"));
var STATUS_TMPL = 'https://twitter.com/%s/status/%s';
function findall(str, regex) {
    var found;
    var matches = [];
    while (true) {
        found = regex.exec(str);
        if (!found) {
            break;
        }
        matches.push(found[0]);
    }
    return matches;
}
function generateRssFeed(screenName, tweets) {
    var feed = new rss_1.default({
        title: "Tweets of " + screenName,
        description: "Rss of tweets for the user '" + screenName + "'",
        generator: 'node-rss and twitter-rss-api',
        site_url: "https://twitter.com/" + screenName,
        feed_url: '', // TODO: fill this in
    });
    lodash_1.default.map(tweets, function (tweet) {
        var itemOptions = {
            title: tweet.full_text,
            description: TweetFormatter_1.default.render(tweet),
            url: util_1.default.format(STATUS_TMPL, tweet.user.screen_name, tweet.id_str),
            date: tweet.created_at,
            author: screenName
        };
        if (tweet.entities) {
            if (tweet.entities.media) {
                lodash_1.default.each(tweet.entities.media, function (item, index) {
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
    return __awaiter(this, void 0, void 0, function () {
        var tweetHandler, options, key, timelineTweets, innerTweetIds, innerTweets, innerTweetsMap_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log("Requested URL [" + request.raw.req.url + "]");
                    tweetHandler = new tweet_handler_1.default(twit);
                    options = { screen_name: request.params.screenName };
                    delete request.query.format;
                    for (key in request.query) {
                        options[key] = request.query[key];
                    }
                    return [4 /*yield*/, twit.statuses.timeline(__assign({ screen_name: request.params.screenName }, options))];
                case 1:
                    timelineTweets = _a.sent();
                    innerTweetIds = lodash_1.default.reduce(timelineTweets, function (curry, timelineTweet) {
                        if (timelineTweet.in_reply_to_status_id_str)
                            curry.push(timelineTweet.in_reply_to_status_id_str);
                        return curry;
                    }, []);
                    return [4 /*yield*/, tweetHandler.getTweets(innerTweetIds)];
                case 2:
                    innerTweets = _a.sent();
                    innerTweetsMap_1 = lodash_1.default.reduce(innerTweets, function (curry, innerTweet) {
                        curry[innerTweet.id_str] = innerTweet;
                        return curry;
                    }, {});
                    timelineTweets = lodash_1.default.map(timelineTweets, function (timelineTweet) {
                        var tweet = timelineTweet;
                        if (tweet.retweeted_status) {
                            tweet = tweet.retweeted_status;
                            tweet.retweetUser = timelineTweet.user;
                        }
                        if (tweet.in_reply_to_status_id_str) {
                            tweet.in_reply_to_tweet = innerTweetsMap_1[tweet.in_reply_to_status_id_str];
                        }
                        return tweet;
                    });
                    return [2 /*return*/, h.response(generateRssFeed(request.params.screenName, timelineTweets))
                            .type('text/xml')];
                case 3:
                    err_1 = _a.sent();
                    console.error(err_1);
                    if (err_1 === false) {
                        return [2 /*return*/, h.response().code(503)];
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.default = {
    handler: handler,
    findall: findall,
    generateRssFeed: generateRssFeed,
    validate: joi_1.default.object({
        params: joi_1.default.object({
            screenName: joi_1.default.string().min(1).required()
        }),
        query: joi_1.default.object({
            user_id: joi_1.default.number().integer().min(0),
            since_id: joi_1.default.number().integer().min(0),
            count: joi_1.default.number().integer().min(0),
            max_id: joi_1.default.number().integer().min(0),
            trim_user: joi_1.default.boolean(),
            exclude_replies: joi_1.default.boolean(),
            contributor_details: joi_1.default.boolean(),
            include_rts: joi_1.default.boolean(),
            format: joi_1.default.string().optional().min(1),
        }),
    }),
};
