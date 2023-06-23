import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { GENERAL_FAILURE } from '@src/common/RequestResponses';

export const validateChallengeRegister = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({
            id: z.coerce.number(),
        }).parse(req.params);
    } catch (error) {
        return res
            .status(GENERAL_FAILURE.httpCode)
            .json({ ...GENERAL_FAILURE, message: 'Invalid register challenge request' });
    }

    next();
};
