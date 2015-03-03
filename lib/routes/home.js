'use strict';

var users = require('../handlers/users');

function route(server) {

  var html = '<html><body><h3>Twitter RSS Shim</h3><p> Test it out: <a href="/user/google?format=rss">here</a></p></body><html>';

  return server.route({
    path : '/',
    method : 'GET',
    config : {
      handler : function(request, reply) {
        return reply(html).code(200);
      }
    },
  });

}

module.exports = route;
