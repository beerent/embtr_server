import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { GENERAL_FAILURE } from '@src/common/RequestResponses';

export namespace HabitCategoryValidation {
    export const validateGetActiveHabitsCategory = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            z.object({
                date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            }).parse(req.query);
        } catch (error) {
            return res
                .status(GENERAL_FAILURE.httpCode)
                .json({ ...GENERAL_FAILURE, message: 'invalid date parameter' });
        }

        next();
    };
}
