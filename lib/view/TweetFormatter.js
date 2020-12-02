const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');
const TweetTransformer = require('./TweetTransformer');

const tweetSatus = fs.readFileSync(path.join(__dirname, './templates/status.mustache'), 'utf8');

const partials = {
  'tweet-base': fs.readFileSync(path.join(__dirname, './templates/tweet-base.mustache'), 'utf8'),
  'tweet-reply': fs.readFileSync(path.join(__dirname, './templates/tweet-reply.mustache'), 'utf8'),
  'tweet-media': fs.readFileSync(path.join(__dirname, './templates/tweet-media.mustache'), 'utf8'),
};

class TweetFormatter {
  static statusTemplate = tweetSatus;

  static render(rawStatusPayload) {
    return Mustache.render(TweetFormatter.statusTemplate, TweetTransformer.parse(rawStatusPayload), partials);
  }
}

module.exports = TweetFormatter;