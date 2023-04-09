import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { INVALID_REQUEST } from '@src/common/RequestResponses';

export const validateGetDailyHistory = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ id: z.coerce.number() }).parse(req.params);
        z.object({
            start: z.string().transform((val) => {
                const date = new Date(val);
                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date format');
                }
            }),
            end: z.string().transform((val) => {
                const date = new Date(val);
                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date format');
                }
            }),
        }).parse(req.query);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json({ ...INVALID_REQUEST, message: 'invalid get daily history request' });
    }

    next();
};
