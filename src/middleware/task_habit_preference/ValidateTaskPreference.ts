import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { INVALID_REQUEST } from '@src/common/RequestResponses';

export const validateTaskPreference = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({
            habitId: z.coerce.number().optional(),
            unitId: z.coerce.number().optional(),
            quantity: z.coerce.number().optional(),
        }).parse(req.params);

        z.object({
            habitId: z.coerce.number().optional(),
        }).parse(req.body);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};
