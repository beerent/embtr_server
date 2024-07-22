import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { Context, ContextType, NewUserContext } from '@src/general/auth/Context';
import { Request } from 'express';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { logger } from '@src/common/logger/Logger';
import { toZonedTime } from 'date-fns-tz';
import { User } from '@resources/schema';
import { HttpCode } from '@src/common/RequestResponses';
import { Roles } from '@src/roles/Roles';

export class ContextService {
    public static async get(request: Request): Promise<Context> {
        const dayKey = this.getDayKey(request);
        const timezone = this.getTimezone(request);
        const dateTime = this.getDateTime(timezone);

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

        return {
            type: ContextType.CONTEXT,
            userId,
            userUid: userUid,
            userEmail: userEmail,
            userRoles: userRoles,
            dayKey: dayKey,
            timeZone: timezone,
            dateTime: dateTime,
        };
    }

    public static async getNewUserContext(request: Request): Promise<NewUserContext> {
        const getUserUid = AuthorizationDao.getUidFromToken(request.headers.authorization!);
        const getUserEmail = AuthorizationDao.getEmailFromToken(request.headers.authorization!);

        const [userUid, userEmail] = await Promise.all([getUserUid, getUserEmail]);

        if (!userUid?.length || !userEmail?.length) {
            logger.error('invalid token for:', userUid, userEmail);
            throw new ServiceException(401, Code.REAUTHENTICATE, 'invalid token');
        }

        return {
            type: ContextType.NEW_USER_CONTEXT,
            userUid: userUid,
            userEmail: userEmail,
        };
    }

    public static impersonateUserContext(context: Context, user: User): Context {
        if (!Roles.isAdmin(context.userRoles)) {
            console.log('user is not admin', context.userRoles);
            throw new ServiceException(HttpCode.FORBIDDEN, Code.FORBIDDEN, 'user is not admin');
        }

        if (!user.id || !user.uid) {
            logger.error('invalid user:', user);
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'invalid user'
            );
        }

        const impersonatedContext: Context = {
            type: ContextType.CONTEXT,
            userId: user.id,
            userUid: user.uid,
            userEmail: '',
            userRoles: [],
            dayKey: '',
            timeZone: '',
            dateTime: new Date(),
        };

        return impersonatedContext;
    }

    public static async getJobContext(request: Request): Promise<Context> {
        const context = await this.get(request);
        context.type = ContextType.JOB_CONTEXT;

        return context;
    }

    private static getDayKey(request: Request): string {
        let dayKey = request.headers['client-daykey'] as string;
        return dayKey;
    }

    private static getTimezone(request: Request): string {
        let timezone = request.headers['client-timezone'] as string;
        return timezone;
    }

    private static getDateTime(timeZone: string): Date {
        const date = new Date();
        const zonedDate = toZonedTime(date, timeZone);

        return zonedDate;
    }
}
