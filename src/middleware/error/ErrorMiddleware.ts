import { ServiceException } from '@src/general/exception/ServiceException';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import { logger } from '@src/common/logger/Logger';

export const runEndpoint = (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
    return (req, res, next) => {
        handler(req, res, next).catch(next);
    };
};

export const handleError = (error: unknown, req: Request, res: Response, next: NextFunction) => {
    const response = ServiceException.getResponse(error);

    logger.info(`EXCEPTION: ${response.httpCode} ${response.internalCode} ${response.message}`);
    res.status(response.httpCode).json(response);
};
