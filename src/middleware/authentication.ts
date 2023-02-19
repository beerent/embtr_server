import { UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { Request, Response, NextFunction } from 'express';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const userIsAuthorized = await AuthenticationController.tokenIsValid(req!.headers!.authorization!);

    if (!userIsAuthorized) {
        return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
    }

    next();
}
