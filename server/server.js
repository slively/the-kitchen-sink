var loopback = require('loopback'),
    boot = require('loopback-boot'),
    server = module.exports = loopback();

// boot scripts mount components like REST API
boot(server, __dirname);

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
server.use(loopback.urlNotFound());

// The ultimate error handler.
server.use(loopback.errorHandler());

server.start = function() {
  // start the web server
  return server.listen(function() {
    server.emit('started');
    console.log('Web server listening at: %s', server.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  server.start();
}
