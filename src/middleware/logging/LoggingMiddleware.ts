import { NextFunction, Request, Response } from 'express';
import { logger } from '@src/common/logger/Logger';

export const routeLogger =
    (receivingVersion: string) => (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const oldSend = res.send;
        res.send = function (data) {
            const endTime = Date.now();
            const elapsedTime = endTime - startTime;
            const contentLength = Buffer.byteLength(data, 'utf-8'); // Get the size of the response data'
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const requestPadding = ' '.repeat(6 - req.method.length);
            const clientVersion = req.header('client-version');

            logger.info(
                `[${timestamp}]  ${req.method}${requestPadding}${res.statusCode}\t${contentLength}b\t${elapsedTime}ms\t ${clientVersion} [${receivingVersion}] ${req.baseUrl}${req.path}`
            );
            return oldSend.apply(this, arguments as any);
        };

        next();
    };
