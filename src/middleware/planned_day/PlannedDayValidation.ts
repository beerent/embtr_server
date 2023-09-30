import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import {
    CREATE_PLANNED_DAY_FAILED,
    CREATE_PLANNED_TASK_FAILED,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    UPDATE_PLANNED_TASK_FAILED,
} from '@src/common/RequestResponses';

const plannedDayGetById = z.object({
    id: z.coerce.number(),
});
export const validateGetById = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedDayGetById.parse(req.params);
    } catch (error) {
        return res
            .status(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode)
            .json(GET_PLANNED_DAY_FAILED_NOT_FOUND);
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
        return res
            .status(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode)
            .json(GET_PLANNED_DAY_FAILED_NOT_FOUND);
    }

    next();
};

const plannedDayPost = z.object({
    dayKey: z.string().min(1),
});
export const validatePlannedDayPost = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedDayPost.parse(req.body);
    } catch (error) {
        return res.status(CREATE_PLANNED_DAY_FAILED.httpCode).json(CREATE_PLANNED_DAY_FAILED);
    }

    next();
};

const plannedTaskPostParams = z.object({
    dayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const validatePlannedTaskPost = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedTaskPostParams.parse(req.params);
    } catch (error) {
        return res.status(CREATE_PLANNED_TASK_FAILED.httpCode).json(CREATE_PLANNED_TASK_FAILED);
    }

    next();
};

const plannedTaskPatch = z.object({
    id: z.coerce.number(),
});
export const validatePlannedTaskPatch = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedTaskPatch.parse(req.body.plannedTask);
    } catch (error) {
        return res.status(UPDATE_PLANNED_TASK_FAILED.httpCode).json(UPDATE_PLANNED_TASK_FAILED);
    }

    next();
};
