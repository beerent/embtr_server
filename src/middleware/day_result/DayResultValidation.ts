import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { GET_DAY_RESULT_INVALID } from '@src/common/RequestResponses';

const plannedDayGetById = z.object({
    id: z.coerce.number(),
});
export const validateGetById = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedDayGetById.parse(req.params);
    } catch (error) {
        return res.status(GET_DAY_RESULT_INVALID.httpCode).json(GET_DAY_RESULT_INVALID);
    }

    next();
};

const plannedDayGetByUser = z.object({
    userId: z.coerce.number(),
    dayKey: z.string(),
});
export const validateGetByUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedDayGetByUser.parse(req.params);
    } catch (error) {
        return res.status(GET_DAY_RESULT_INVALID.httpCode).json(GET_DAY_RESULT_INVALID);
    }

    next();
};
