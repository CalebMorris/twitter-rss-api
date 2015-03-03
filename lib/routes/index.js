'use strict';

module.exports = function(twit, server) {
  require('./users')(twit, server);
  require('./home')(server);
};
