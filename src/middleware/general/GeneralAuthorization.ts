import { FORBIDDEN } from '@src/common/RequestResponses';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { Role, Roles } from '@src/roles/Roles';
import { NextFunction, Request, Response } from 'express';

export async function authorize(req: Request, res: Response, next: NextFunction) {
    const userId = await AuthorizationDao.getUserIdFromToken(req.headers.authorization!);
    if (!userId) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    const userRoles = await AuthorizationDao.getRolesFromToken(req.headers.authorization!);
    if (!userRoles.includes(Role.ADMIN) && !userRoles.includes(Role.USER)) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    next();
}

export async function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
    const userId = await AuthorizationDao.getUserIdFromToken(req.headers.authorization!);
    if (!userId) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    const userRoles = await AuthorizationDao.getRolesFromToken(req.headers.authorization!);
    if (!Roles.isAdmin(userRoles)) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    next();
}
