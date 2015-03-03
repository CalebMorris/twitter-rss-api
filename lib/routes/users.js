'use strict';

var users = require('../handlers/users');

function route(twit, server) {

  return server.route({
    path : '/user/{screenName}',
    method : 'GET',
    config : {
      handler : users.handler.bind(null, twit),
      validate : users.validate,
    },
  });

}

module.exports = route;
