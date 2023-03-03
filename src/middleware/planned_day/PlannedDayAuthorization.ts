import { FORBIDDEN } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { Role } from '@src/roles/Roles';
import { NextFunction, Request, Response } from 'express';
import { CreatePlannedDayRequest } from '@resources/types';

export async function authorizeGet(req: Request, res: Response, next: NextFunction) {
    const userRoles = await AuthorizationController.getRolesFromToken(req.headers.authorization!);

    if (!userRoles.includes(Role.ADMIN) && !userRoles.includes(Role.USER)) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    next();
}

export async function authorizePost(req: Request, res: Response, next: NextFunction) {
    const body: CreatePlannedDayRequest = req.body;

    const requesterId = await AuthorizationController.getUserIdFromToken(req.headers.authorization!);
    if (requesterId !== body.userId) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    const userRoles = await AuthorizationController.getRolesFromToken(req.headers.authorization!);
    if (!userRoles.includes(Role.ADMIN) && !userRoles.includes(Role.USER)) {
        return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
    }

    next();
}
