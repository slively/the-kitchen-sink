var winston = require('winston'),
    container = new winston.Container();

module.exports = function loggerDev() {
    container.add('default', {
        transports: [
            new (winston.transports.Console)({
                level: 'debug',
                handleExceptions: false,
                prettyPrint: true,
                timestamp: true
            })
        ]
    });
    return container;
};