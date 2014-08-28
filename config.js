var Confidence = require('confidence');

var store      = new Confidence.Store();

var config = {
  twitter : {
    apiKey    : process.env.TWITTER_API_KEY || '',
    apiSecret : process.env.TWITTER_API_SECRET || ''
  }
};
store.load(config);

module.exports = store;