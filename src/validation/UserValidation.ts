import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import { HttpCode } from '@src/common/RequestResponses';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { ContextService } from '@src/service/ContextService';
import { DateUtility } from '@src/utility/date/DateUtility';

export namespace UserValidation {
    export const validateRegisterPushNotificationRequest = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            z.object({
                token: z.string(),
            }).parse(req.body);
        } catch (error) {
            throw new ServiceException(
                HttpCode.INVALID_REQUEST,
                Code.INVALID_PUSH_NOTIFICATION_TOKEN,
                'invalid push notification token'
            );
        }

        next();
    };

    export const validateTimelineDayResultsRequest = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            z.object({
                userId: z.coerce.number(),
                limit: z.number().optional(),
            }).parse(req.params);
        } catch (error) {
            throw new ServiceException(
                HttpCode.INVALID_REQUEST,
                Code.INVALID_REQUEST,
                'invalid params'
            );
        }

        next();
    };

    export const validateCreateBlockUserRequest = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            z.object({
                userId: z.coerce.number(),
            }).parse(req.body);
        } catch (error) {
            throw new ServiceException(
                HttpCode.INVALID_REQUEST,
                Code.INVALID_REQUEST,
                'invalid params'
            );
        }

        next();
    };
}
