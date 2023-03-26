import z from 'zod';
import { NextFunction, Request, Response } from 'express';
import { GENERAL_FAILURE } from '@src/common/RequestResponses';

export const validateClearNotifications = (req: Request, res: Response, next: NextFunction) => {
    try {
        z.object({
            notificationIds: z.array(z.coerce.number()),
        }).parse(req.body);
    } catch (error) {
        return res.status(GENERAL_FAILURE.httpCode).json({ ...GENERAL_FAILURE, message: 'invalid request' });
    }

    next();
};
