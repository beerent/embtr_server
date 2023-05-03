import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { INVALID_REQUEST } from '@src/common/RequestResponses';

export const validateTaskHabitPreference = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({
            id: z.coerce.number(),
        }).parse(req.params);

        z.object({
            habitId: z.coerce.number(),
        }).parse(req.body);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};
