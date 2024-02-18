import winston from 'winston';

const isTestEnv = process.env.NODE_ENV === 'test';

const silentInTestEnv = (
    transport:
        | winston.transports.FileTransportInstance
        | winston.transports.ConsoleTransportInstance
) => {
    if (isTestEnv) {
        transport.silent = true;
    }
    return transport;
};

// Custom format function to colorize the version part of the log message
const colorizeVersion = winston.format((info, opts) => {
    if (info.message) {
        if (info.message.includes('✓')) {
            info.message = info.message.replace(/ \[(.*?)] /g, '\x1b[32m [$1] \x1b[0m');
        } else {
            info.message = info.message.replace(/ \[(.*?)] /g, '\x1b[33m [$1] \x1b[0m');
        }
    }
    return info;
});

// Custom format function to colorize response code
const colorizeResponseCode = winston.format((info, opts) => {
    if (info.message) {
        const responseCode = info.message.match(/\b(\d{3})\b(?=\s|$)/); // Match response code followed by a space or end of line
        if (responseCode) {
            const code = parseInt(responseCode[0]);
            if (code >= 200 && code < 300) {
                info.message = info.message.replace(
                    responseCode[0],
                    `\x1b[32m${responseCode[0]}\x1b[0m`
                );
            } else {
                info.message = info.message.replace(
                    responseCode[0],
                    `\x1b[31m${responseCode[0]}\x1b[0m`
                );
            }
        }
    }
    return info;
});

// Create a logger instance
export const logger = winston.createLogger({
    level: 'info',
    transports: [
        silentInTestEnv(new winston.transports.File({ filename: 'error.log', level: 'error' })),
        silentInTestEnv(new winston.transports.File({ filename: 'combined.log' })),
    ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
logger.add(
    silentInTestEnv(
        new winston.transports.Console({
            format: winston.format.combine(
                colorizeVersion(), // Apply the colorizeVersion format
                colorizeResponseCode(), // Apply the colorizeResponseCode format
                winston.format.colorize(),
                winston.format.simple()
            ),
        })
    )
);
