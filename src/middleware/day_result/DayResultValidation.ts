import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { GET_DAY_RESULT_INVALID } from '@src/common/RequestResponses';

const dayResultGetById = z.object({
    id: z.coerce.number(),
});
export const validateGetById = (req: Request, res: Response, next: NextFunction) => {
    try {
        dayResultGetById.parse(req.params);
    } catch (error) {
        return res.status(GET_DAY_RESULT_INVALID.httpCode).json(GET_DAY_RESULT_INVALID);
    }

    next();
};

const dayResultGetByUser = z.object({
    userId: z.coerce.number(),
    dayKey: z.string(),
});
export const validateGetByUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        dayResultGetByUser.parse(req.params);
    } catch (error) {
        return res.status(GET_DAY_RESULT_INVALID.httpCode).json(GET_DAY_RESULT_INVALID);
    }

    next();
};

const dayResultPost = z.object({
    plannedDayId: z.coerce.number(),
});
export const validatePost = (req: Request, res: Response, next: NextFunction) => {
    try {
        dayResultPost.parse(req.body);
    } catch (error) {
        return res.status(GET_DAY_RESULT_INVALID.httpCode).json(GET_DAY_RESULT_INVALID);
    }

    next();
};
