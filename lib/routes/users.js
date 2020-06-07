'use strict';

var users = require('../handlers/users');

function route(twit, server) {

  return server.route({
    path : '/user/{screenName}',
    method : 'GET',
    options : {
      validate : users.validate,
    },
    handler : users.handler.bind(null, twit),
  });

}

module.exports = route;
