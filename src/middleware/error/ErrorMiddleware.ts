import { NextFunction, Request, Response, RequestHandler } from 'express';

export const runEndpoint = (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
    return (req, res, next) => {
        handler(req, res, next).catch(next);
    };
};

export const handleError = (error: Error, req: Request, res: Response, next: NextFunction) => {
    //console.error(error.stack);
    res.status(500).send('Internal Server Error');
};
