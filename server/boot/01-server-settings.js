var fs = require('fs'),
    loopback = require('loopback'),
    bodyParser = require('body-parser');

module.exports = function serverSettings(server) {
    var env = server.get('env'),
        envConfig = (env && env !== 'development') ? ('.' + env) : '',
        clientConfigFile = 'config' + envConfig + '.json',
        serverConfigFile = 'config' + envConfig + '.json',
        serverDSConfigFile = 'datasources' + envConfig + '.json',
        loggerDir = __dirname + '/../logger/',
        loggerFile = 'logger' + envConfig + '.js';

    // instantiate logger
    try {
        server.loggers = require(loggerDir + loggerFile)(server);
        server.logger = server.loggers.get('default');
        if (env !== 'development') {
            server.logger.info('Logger loaded from ' + loggerFile);
        }
    } catch(e) {
        if (loggerFile !== 'logger.js') {
            server.loggers = require(loggerDir + 'logger.js')(server);
            server.logger = server.loggers.get('default');
            if (env !== 'development') {
                server.logger.warn('Logger \'' + loggerFile + '\' not found, using logger.js');
            }
        } else {
            throw e;
        }
    }

    if (env !== 'development') {
        if (fs.existsSync(__dirname + '/../../client/' + clientConfigFile)) {
            server.logger.info('Client using ' + clientConfigFile);
        } else {
            server.logger.warn('Client \'' + clientConfigFile + '\' not found, using config.json');
        }

        if (fs.existsSync(__dirname + '/../' + serverConfigFile)) {
            server.logger.info('Server using ' + serverConfigFile);
        } else {
            server.logger.warn('Server \'' + serverConfigFile + '\' not found, using config.json');
        }

        if (fs.existsSync(__dirname + '/../' + serverDSConfigFile)) {
            server.logger.info('Server using ' + serverDSConfigFile);
        } else {
            server.logger.warn('Server \'' + serverDSConfigFile + '\' not found, using datasources.json');
        }
    }

    server.disable('x-powered-by');
    server.disable('etag');

    // request pre-processing middleware
    server.use(loopback.compress());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
};
