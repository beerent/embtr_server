import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import {
    CREATE_PLANNED_DAY_FAILED,
    CREATE_PLANNED_TASK_FAILED,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    UPDATE_PLANNED_TASK_FAILED,
} from '@src/common/RequestResponses';

const sheduledHabitPost = z.object({
    quantity: z.number().optional(),
});
export const validateScheduledHabitPost = (req: Request, res: Response, next: NextFunction) => {
    try {
        sheduledHabitPost.parse(req.body);
    } catch (error) {
        return res.status(CREATE_PLANNED_DAY_FAILED.httpCode).json(CREATE_PLANNED_DAY_FAILED);
    }

    next();
};
