import { FORBIDDEN } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { Role } from '@src/roles/Roles';
import { Request, Response, NextFunction } from 'express';

export async function authorizeUserGet(req: Request, res: Response, next: NextFunction) {
    const userRoles = await AuthorizationController.getRolesFromToken(req.headers.authorization!);

    if (!userRoles.includes(Role.ADMIN) || !userRoles.includes(Role.USER)) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    next();
}
