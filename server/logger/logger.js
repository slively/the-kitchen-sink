var winston = require('winston'),
    container = new winston.Container();


// Server is passed in case you want to use any config.json items
module.exports = function loggerDev(/* server */) {
    /*
    Documentation: https://github.com/flatiron/winston


    -- Example: Log everything to the console and common.log, log errors to error.log. --

    var fs = require('fs'),
    logsDir = __dirname + '../logs';

    try {
        fs.mkdirSync(logsDir);
    } catch(e) {console.log(e);}

    container.add('default', {
        transports: [
            new (winston.transports.Console)({level:'debug', handleExceptions: true, prettyPrint: true, silent:false, timestamp: true, colorize: true, json: false}),
            new (winston.transports.File)({ filename: logsDir + '/common.log',name:'file.all',level:'debug',maxsize: 1024000,maxFiles: 10, handleExceptions: true,json: false}),
            new (winston.transports.File)({ filename: logsDir + '/error.log',name:'file.error',level:'error',maxsize: 1024000,maxFiles: 10, handleExceptions: true,json: false})
        ]
    });
    */

    container.add('default', {
        transports: [
            new (winston.transports.Console)({
                level: 'debug',
                handleExceptions: false,
                prettyPrint: true,
                silent: false,
                timestamp: true,
                colorize: true,
                json: false
            })
        ]
    });

    /*
        Return the logging container:
            server.logger will be set to the 'default' logger
            server.loggers will be set to the entire container

        Examples:
            server.logger.info('info message');
            server.logger.error('error message');
            server.loggers.get('some-other-logger').info('some other logger info message');
            server.loggers.get('some-other-logger').error('some other logger error message');
     */
    return container;
};