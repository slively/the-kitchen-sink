var loopback = require('loopback'),
    bodyParser = require('body-parser');

module.exports = function serverSettings(app) {
    app.disable('x-powered-by');
    app.disable('etag');

    // Set up the /favicon.ico
    app.use(loopback.favicon(__dirname+'/../../client/img/favicon.ico'));

    // request pre-processing middleware
    app.use(loopback.compress());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
};
