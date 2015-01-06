var loopback = require('loopback'),
    bodyParser = require('body-parser');

module.exports = function serverSettings(server) {
    // instantiate logger
    require('../logger')(server);
    server.disable('x-powered-by');
    server.disable('etag');

    // Set up the /favicon.ico
    server.use(loopback.favicon(__dirname+'/../../client/img/favicon.ico'));

    // request pre-processing middleware
    server.use(loopback.compress());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
};
