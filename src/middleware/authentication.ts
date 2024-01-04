import { UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { Request, Response, NextFunction } from 'express';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const userIsAuthorized = await AuthenticationDao.tokenIsValid(
        req!.headers!.authorization!
    );
    if (!userIsAuthorized) {
        return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
    }

    const userIdFromToken = await AuthorizationDao.getUserIdFromToken(
        req.headers.authorization!
    );
    if (!userIdFromToken) {
        const uid = await AuthorizationDao.getUidFromToken(req.headers.authorization!);
        if (!uid) {
            return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
        }

        return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
    }

    next();
}

export async function authenticateCreateUser(req: Request, res: Response, next: NextFunction) {
    const userIsAuthorized = await AuthenticationDao.tokenIsValid(
        req!.headers!.authorization!
    );
    if (!userIsAuthorized) {
        return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
    }

    const userIdFromToken = await AuthorizationDao.getUserIdFromToken(
        req.headers.authorization!
    );
    if (!userIdFromToken) {
        const uid = await AuthorizationDao.getUidFromToken(req.headers.authorization!);
        if (!uid) {
            return res.status(UNAUTHORIZED.httpCode).json(UNAUTHORIZED);
        }
    }

    next();
}
