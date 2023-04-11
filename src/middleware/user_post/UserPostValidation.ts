import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { INVALID_REQUEST } from '@src/common/RequestResponses';

export const validatePost = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ userPost: z.object({ title: z.string(), body: z.string() }) }).parse(req.body);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};

export const validateGetById = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ id: z.coerce.number() }).parse(req.params);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};

export const validateUpdate = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ userPost: z.object({ id: z.coerce.number() }) }).parse(req.body);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};

export const validateLike = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ id: z.coerce.number() }).parse(req.params);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};

export const validateGetUserPosts = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({ userId: z.coerce.number() }).parse(req.params);
    } catch (error) {
        return res.status(INVALID_REQUEST.httpCode).json(INVALID_REQUEST);
    }

    next();
};
