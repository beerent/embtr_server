import winston from 'winston';

const isTestEnv = process.env.NODE_ENV === 'test';

const silentInTestEnv = (transport: winston.transports.FileTransportInstance | winston.transports.ConsoleTransportInstance) => {
    if (isTestEnv) {
        transport.silent = true;
    }
    return transport;
};

// Create a logger instance
export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        silentInTestEnv(new winston.transports.File({ filename: 'error.log', level: 'error' })),
        silentInTestEnv(new winston.transports.File({ filename: 'combined.log' })),
    ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        silentInTestEnv(
            new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            })
        )
    );
}
