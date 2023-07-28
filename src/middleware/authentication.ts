import { REAUTHENTICATE, UNAUTHORIZED } from '@src/common/RequestResponses';
import { AccountController } from '@src/controller/AccountController';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { UserController } from '@src/controller/UserController';
import { Request, Response, NextFunction } from 'express';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const userIsAuthorized = await AuthenticationController.tokenIsValid(
        req!.headers!.authorization!
    );
    if (!userIsAuthorized) {
        return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
    }

    const userIdFromToken = await AuthorizationController.getUserIdFromToken(
        req.headers.authorization!
    );
    if (!userIdFromToken) {
        const uid = await AuthorizationController.getUidFromToken(req.headers.authorization!);
        if (!uid) {
            return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
        }

        return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
    }

    next();
}

export async function authenticateCreateUser(req: Request, res: Response, next: NextFunction) {
    const userIsAuthorized = await AuthenticationController.tokenIsValid(
        req!.headers!.authorization!
    );
    if (!userIsAuthorized) {
        return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
    }

    const userIdFromToken = await AuthorizationController.getUserIdFromToken(
        req.headers.authorization!
    );
    if (!userIdFromToken) {
        const uid = await AuthorizationController.getUidFromToken(req.headers.authorization!);
        if (!uid) {
            return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
        }
    }

    next();
}
