const winston = require('winston');

let logger = null;

function initLogger(logLevel) {
    let l = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                level: logLevel,
                timestamp: function () {
                    return new Date().toISOString();
                },
                formatter: function (options) {
                    // Return string will be passed to logger.
                    return options.timestamp() + ': [' + options.level.toUpperCase() + '] ' + (options.message ? options.message : '') +
                        (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
                }
            })
        ]
    });
    logger = l;
    return logger;
}

function getLogger() {
    if (!logger) {
        throw new Error('Run initLogger first!');
    }
    return logger;
}

module.exports.getLogger = getLogger;
module.exports.initLogger = initLogger;