var Confidence = require('confidence');

var store      = new Confidence.Store();

var config = {
  twitter : {
    apiKey    : 'API_KEY',
    apiSecret : 'API_SECRET'
  }
}
store.load(config);

module.exports = store;