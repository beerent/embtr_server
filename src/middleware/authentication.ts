import { UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { Request, Response, NextFunction } from 'express';

function isAuthorized(userId: string): boolean {
    return false;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.userid;
    const result = await AuthenticationController.tokenIsValid(req!.headers!.authorization!);

    if (!isAuthorized(userId)) {
        return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
    }

    next();
}
