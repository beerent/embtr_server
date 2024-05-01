import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import {
    GENERAL_FAILURE,
    GET_DAY_RESULT_INVALID,
    UPDATE_PLANNED_DAY_RESULT_INVALID,
} from '@src/common/RequestResponses';
import {
    CreatePlannedDayResultRequest,
    UpdatePlannedDayResultRequest,
} from '@resources/types/requests/PlannedDayResultTypes';

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

const dayResultPost = z.object({});
export const validatePost = (req: Request, res: Response, next: NextFunction) => {
    try {
        const request: CreatePlannedDayResultRequest = req.body;
        dayResultPost.parse(request);
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
        return res
            .status(UPDATE_PLANNED_DAY_RESULT_INVALID.httpCode)
            .json(UPDATE_PLANNED_DAY_RESULT_INVALID);
    }

    next();
};

export const validateLikePost = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ id: z.coerce.number() }).parse(req.params);
    } catch (error) {
        return res
            .status(GENERAL_FAILURE.httpCode)
            .json({ ...GENERAL_FAILURE, message: 'invalid like request' });
    }

    next();
};

export const validateGetAllPlannedDayResults = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        z.object({ upperBound: z.string(), lowerBound: z.string() }).parse(req.query);
    } catch (error) {
        return res
            .status(GENERAL_FAILURE.httpCode)
            .json({ ...GENERAL_FAILURE, message: 'invalid date range' });
    }

    next();
};

export const validatePlannedDayResultHideRecommendation = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        z.object({ dayKey: z.string() }).parse(req.params);
    } catch (error) {
        return res
            .status(GENERAL_FAILURE.httpCode)
            .json({ ...GENERAL_FAILURE, message: 'invalid day key' });
    }

    next();
};
