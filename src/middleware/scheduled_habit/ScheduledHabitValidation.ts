import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { CREATE_PLANNED_DAY_FAILED } from '@src/common/RequestResponses';
import { ArchiveScheduledHabitRequest } from '@resources/types/requests/ScheduledHabitTypes';

const sheduledHabitPost = z.object({
    scheduledHabit: z.object({
        id: z.coerce.number().optional(),
        quantity: z.coerce.number().optional(),
    }),
});
export const validateScheduledHabitPost = (req: Request, res: Response, next: NextFunction) => {
    try {
        sheduledHabitPost.parse(req.body);
    } catch (error) {
        return res.status(CREATE_PLANNED_DAY_FAILED.httpCode).json(CREATE_PLANNED_DAY_FAILED);
    }

    next();
};

export const validateScheduledHabitGet = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({
            id: z.coerce.number(),
        }).parse(req.params);
    } catch (error) {
        return res.status(CREATE_PLANNED_DAY_FAILED.httpCode).json(CREATE_PLANNED_DAY_FAILED);
    }

    next();
};

export const validateScheduledHabitArchive = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({
            id: z.coerce.number(),
        }).parse(req.params);
    } catch (error) {
        return res.status(CREATE_PLANNED_DAY_FAILED.httpCode).json(CREATE_PLANNED_DAY_FAILED);
    }

    next();
};
