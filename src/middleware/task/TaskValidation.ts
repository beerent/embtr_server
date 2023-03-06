import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { SEARCH_TASKS_FAILED } from '@src/common/RequestResponses';

const plannedDayGetById = z.object({
    q: z.string(),
});
export const validateSearch = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedDayGetById.parse(req.query);
    } catch (error) {
        return res.status(SEARCH_TASKS_FAILED.httpCode).json(SEARCH_TASKS_FAILED);
    }

    next();
};
