import { NextFunction, Request, Response } from 'express';
import z from 'zod';
import { HttpCode } from '@src/common/RequestResponses';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { ContextService } from '@src/service/ContextService';
import { DateUtility } from '@src/utility/date/DateUtility';

export namespace AccountValidation {
    export const validateHardDelete = (req: Request, res: Response, next: NextFunction) => {
        try {
            z.object({
                email: z.string(),
            }).parse(req.params);
        } catch (error) {
            throw new ServiceException(
                HttpCode.INVALID_REQUEST,
                Code.INVALID_PUSH_NOTIFICATION_TOKEN,
                'invalid push notification token'
            );
        }

        next();
    };
}
