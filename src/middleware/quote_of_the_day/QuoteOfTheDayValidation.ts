import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { INVALID_REQUEST } from '@src/common/RequestResponses';

export const validateAddQuoteOfTheDay = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({
            quote: z.string().nonempty(),
        }).parse(req.body);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};
