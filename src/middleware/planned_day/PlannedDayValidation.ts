import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { GET_PLANNED_DAY_FAILED_NOT_FOUND } from '@src/common/RequestResponses';

const plannedDayGetById = z.object({
    id: z.coerce.number(),
});
export const validateGetById = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedDayGetById.parse(req.params);
    } catch (error) {
        return res.status(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode).json(GET_PLANNED_DAY_FAILED_NOT_FOUND);
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
        return res.status(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode).json(GET_PLANNED_DAY_FAILED_NOT_FOUND);
    }

    next();
};
