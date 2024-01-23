import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { Context, NewUserContext } from '@src/general/auth/Context';
import { Request } from 'express';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { logger } from '@src/common/logger/Logger';

export class ContextService {
    public static async get(request: Request): Promise<Context> {
        const getUserId = AuthorizationDao.getUserIdFromToken(request.headers.authorization!);
        const getUserUid = AuthorizationDao.getUidFromToken(request.headers.authorization!);
        const getUserEmail = AuthorizationDao.getEmailFromToken(request.headers.authorization!);
        const getUserRoles = AuthorizationDao.getRolesFromToken(request.headers.authorization!);

        const [userId, userUid, userEmail, userRoles] = await Promise.all([
            getUserId,
            getUserUid,
            getUserEmail,
            getUserRoles,
        ]);

        if (!userId || !userUid?.length || !userEmail?.length) {
            logger.error('invalid token for:', userId, userUid, userEmail);
            throw new Error('ContextService: invalid state');
        }

        return { userId, userUid: userUid, userEmail: userEmail, userRoles: userRoles };
    }

    public static async getNewUserContext(request: Request): Promise<NewUserContext> {
        const getUserUid = AuthorizationDao.getUidFromToken(request.headers.authorization!);
        const getUserEmail = AuthorizationDao.getEmailFromToken(request.headers.authorization!);

        const [userUid, userEmail] = await Promise.all([getUserUid, getUserEmail]);

        if (!userUid?.length || !userEmail?.length) {
            logger.error('invalid token for:', userUid, userEmail);
            throw new ServiceException(401, Code.REAUTHENTICATE, 'invalid token');
        }

        return { userUid: userUid, userEmail: userEmail };
    }
}
