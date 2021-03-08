"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mustache_1 = __importDefault(require("mustache"));
const TweetTransformer_1 = __importDefault(require("./TweetTransformer"));
const tweetSatus = fs_1.default.readFileSync(path_1.default.join(__dirname, './templates/status.mustache'), 'utf8');
const partials = {
    'tweet-base': fs_1.default.readFileSync(path_1.default.join(__dirname, './templates/tweet-base.mustache'), 'utf8'),
    'tweet-reply': fs_1.default.readFileSync(path_1.default.join(__dirname, './templates/tweet-reply.mustache'), 'utf8'),
    'tweet-media': fs_1.default.readFileSync(path_1.default.join(__dirname, './templates/tweet-media.mustache'), 'utf8'),
    'retweeted-by': fs_1.default.readFileSync(path_1.default.join(__dirname, './templates/retweeted-by.mustache'), 'utf8'),
};
class TweetFormatter {
    static render(rawStatusPayload) {
        this.validate(rawStatusPayload);
        return mustache_1.default.render(TweetFormatter.statusTemplate, TweetTransformer_1.default.parse(rawStatusPayload), partials);
    }
    /**
     * Confirms required content
     */
    static validate(tweet) {
        validatePath(tweet, 'user.screen_name');
        validatePath(tweet, 'user.profile_image_url_https');
        validatePath(tweet, 'user.name');
        validatePath(tweet, 'in_reply_to_screen_name');
        validatePath(tweet, 'full_text');
        // validatePath(tweet, 'text'); // TODO: settings?
        validatePath(tweet, 'id_str');
        validatePath(tweet, 'created_at');
    }
}
exports.default = TweetFormatter;
TweetFormatter.statusTemplate = tweetSatus;
function validatePath(obj, path) {
    if (!lodash_1.default.has(obj, path)) {
        throw new Error(`Unable to resolve [${path}] in ${JSON.stringify(obj)}`);
    }
}
