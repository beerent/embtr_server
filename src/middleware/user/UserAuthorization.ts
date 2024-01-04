import { FORBIDDEN } from '@src/common/RequestResponses';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { Role } from '@src/roles/Roles';
import { Request, Response, NextFunction } from 'express';

export async function authorizeUserGet(req: Request, res: Response, next: NextFunction) {
    const userRoles = await AuthorizationDao.getRolesFromToken(req.headers.authorization!);

    if (!userRoles.includes(Role.ADMIN) && !userRoles.includes(Role.USER)) {
        const requesterUid = await AuthorizationDao.getUidFromToken(req.headers.authorization!);
        if (req.params.uid !== requesterUid) {
            return res.status(FORBIDDEN.httpCode).json(FORBIDDEN);
        }
    }

    next();
}
