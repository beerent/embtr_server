import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { Context, NewUserContext } from '@src/general/auth/Context';
import { Request } from 'express';
import { ServiceException } from '@src/general/exception/ServiceException';

export class ContextService {
    public static async get(request: Request): Promise<Context> {
        const getUserId = AuthorizationDao.getUserIdFromToken(request.headers.authorization!);
        const getUserUid = AuthorizationDao.getUidFromToken(request.headers.authorization!);
        const getUserEmail = AuthorizationDao.getEmailFromToken(request.headers.authorization!);

        const [userId, userUid, userEmail] = await Promise.all([
            getUserId,
            getUserUid,
            getUserEmail,
        ]);

        if (!userId || !userUid?.length || !userEmail?.length) {
            throw new Error('ContextService: invalid state');
        }

        return { userId, userUid: userUid, userEmail: userEmail };
    }

    public static async getNewUserContext(request: Request): Promise<NewUserContext> {
        const getUserUid = AuthorizationDao.getUidFromToken(request.headers.authorization!);
        const getUserEmail = AuthorizationDao.getEmailFromToken(request.headers.authorization!);

        const [userUid, userEmail] = await Promise.all([getUserUid, getUserEmail]);

        if (!userUid?.length || !userEmail?.length) {
            throw new Error('ContextService: invalid state');
        }

        return { userUid: userUid, userEmail: userEmail };
    }
}
