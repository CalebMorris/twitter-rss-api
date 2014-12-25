'use strict';

module.exports = function(twit, server) {
  return require('./users')(twit, server);
};
