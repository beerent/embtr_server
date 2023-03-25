import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import {
    CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID,
    DELETE_PLANNED_DAY_RESULT_COMMENT_INVALID,
    GENERAL_FAILURE,
    GET_DAY_RESULT_INVALID,
    UPDATE_PLANNED_DAY_RESULT_INVALID,
} from '@src/common/RequestResponses';
import { CreatePlannedDayResultCommentRequest, UpdatePlannedDayResultRequest } from '@resources/types/PlannedDayResultTypes';

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

const plannedDayResultPatch = z.object({
    plannedDayResult: z.object({
        id: z.coerce.number(),
    }),
});
export const validatePatch = (req: Request, res: Response, next: NextFunction) => {
    try {
        const request = req.body as UpdatePlannedDayResultRequest;
        plannedDayResultPatch.parse(request);
    } catch (error) {
        return res.status(UPDATE_PLANNED_DAY_RESULT_INVALID.httpCode).json(UPDATE_PLANNED_DAY_RESULT_INVALID);
    }

    next();
};

export const validateCommentPost = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ comment: z.string() }).parse(req.body);
        z.object({ id: z.coerce.number() }).parse(req.params);
    } catch (error) {
        return res.status(CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID.httpCode).json(CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID);
    }

    next();
};

const plannedDayResultCommentDelete = z.object({
    id: z.coerce.number(),
});
export const validateCommentDelete = (req: Request, res: Response, next: NextFunction) => {
    try {
        plannedDayResultCommentDelete.parse(req.params);
    } catch (error) {
        return res.status(DELETE_PLANNED_DAY_RESULT_COMMENT_INVALID.httpCode).json(DELETE_PLANNED_DAY_RESULT_COMMENT_INVALID);
    }

    next();
};

export const validateLikePost = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ id: z.coerce.number() }).parse(req.params);
    } catch (error) {
        return res.status(GENERAL_FAILURE.httpCode).json({ ...GENERAL_FAILURE, message: 'invalid like request' });
    }

    next();
};
