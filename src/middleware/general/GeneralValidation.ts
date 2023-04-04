import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { GENERAL_FAILURE, INVALID_REQUEST } from '@src/common/RequestResponses';

export const validateCommentPost = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ comment: z.string() }).parse(req.body);
        z.object({ id: z.coerce.number() }).parse(req.params);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json({ ...INVALID_REQUEST, message: 'invalid comment request' });
    }

    next();
};

export const validateCommentDelete = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ id: z.coerce.number() }).parse(req.params);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
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
