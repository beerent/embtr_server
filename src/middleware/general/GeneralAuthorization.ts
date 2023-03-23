import { FORBIDDEN } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { Role } from '@src/roles/Roles';
import { NextFunction, Request, Response } from 'express';

export async function authorize(req: Request, res: Response, next: NextFunction) {
    const userId = await AuthorizationController.getUserIdFromToken(req.headers.authorization!);
    if (!userId) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    const userRoles = await AuthorizationController.getRolesFromToken(req.headers.authorization!);
    if (!userRoles.includes(Role.ADMIN) && !userRoles.includes(Role.USER)) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    next();
}
