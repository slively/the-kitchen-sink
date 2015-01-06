/*
    Logger instantiator:
        Will load logger.environment.js when NODE_ENV=environment
        Will load logger.js by default or when NODE_ENV=development
 */
module.exports = function loadLoggerForENV(server) {
    var env = server.get('env'),
        defaultName = './logger.js',
        filename = (env && env !== 'development') ? './logger.' + env + '.js' : defaultName,
        container;

    try {
        container = require(filename)(server);
    } catch(e) {
        if (filename != defaultName) {
            container = require(defaultName)(server);
        } else {
            throw e;
        }
    }

    server.loggers = container;
    server.logger = container.get('default');
};