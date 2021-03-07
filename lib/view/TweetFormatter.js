const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const TweetTransformer = require('./TweetTransformer');

const tweetSatus = fs.readFileSync(path.join(__dirname, './templates/status.mustache'), 'utf8');

const partials = {
  'tweet-base': fs.readFileSync(path.join(__dirname, './templates/tweet-base.mustache'), 'utf8'),
  'tweet-reply': fs.readFileSync(path.join(__dirname, './templates/tweet-reply.mustache'), 'utf8'),
  'tweet-media': fs.readFileSync(path.join(__dirname, './templates/tweet-media.mustache'), 'utf8'),
  'retweeted-by': fs.readFileSync(path.join(__dirname, './templates/retweeted-by.mustache'), 'utf8'),
};

class TweetFormatter {
  static statusTemplate = tweetSatus;

  static render(rawStatusPayload) {
    this.validate(rawStatusPayload);
    return Mustache.render(TweetFormatter.statusTemplate, TweetTransformer.parse(rawStatusPayload), partials);
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

function validatePath(obj, path) {
  if (!_.has(obj, path)) {
    throw new Error(`Unable to resolve [${path}] in ${JSON.stringify(obj)}`);
  }
}

module.exports = TweetFormatter;