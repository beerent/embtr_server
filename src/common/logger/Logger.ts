import winston from 'winston';

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
    level: 'http',
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
logger.add(
    new winston.transports.Console({
        format: winston.format.combine(
            colorizeVersion(), // Apply the colorizeVersion format
            colorizeResponseCode(), // Apply the colorizeResponseCode format
            winston.format.colorize({ colors: { http: 'green', info: 'cyan' } }),
            winston.format.simple()
        ),
    })
);
