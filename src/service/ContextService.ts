import { AuthorizationDao } from '@src/database/AuthorizationDao';
import {
    AdminContext,
    Context,
    ContextType,
    JobContext,
    NewUserContext,
    UserContext,
} from '@src/general/auth/Context';
import { Request } from 'express';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { logger } from '@src/common/logger/Logger';
import { toZonedTime } from 'date-fns-tz';
import { User } from '@resources/schema';
import { HttpCode } from '@src/common/RequestResponses';
import { Roles } from '@src/roles/Roles';
import { UserPropertyUtility } from '@src/utility/UserPropertyUtility';
import { DateUtility } from '@src/utility/date/DateUtility';

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
            isAdmin: Roles.isAdmin(userRoles),
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

    public static contextToUserContext(context: Context): UserContext {
        return { ...context, isUser: true, isAdmin: false };
    }

    public static impersonateUserContext(context: Context, user: User): UserContext {
        if (!context.isAdmin) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'cannot impersonate user as admin'
            );
        }

        const timeZone = UserPropertyUtility.getTimezone(user);
        const userRoles = Roles.getRoles(user.roles?.map((role) => role.name ?? '') ?? []);

        if (!user.id || !user.uid || !user.email || !user.roles || !timeZone) {
            logger.error('invalid user:', user);
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'invalid user'
            );
        }

        const impersonatedContext: UserContext = {
            type: ContextType.CONTEXT,
            userId: user.id,
            userUid: user.uid,
            userEmail: user.email,
            userRoles: userRoles,
            dayKey: '',
            timeZone: timeZone,
            dateTime: DateUtility.getDateWithTimezone(new Date(), timeZone),
            isUser: true,
            isAdmin: false,
        };

        return impersonatedContext;
    }

    public static async getUserContext(request: Request): Promise<UserContext> {
        const context = await this.get(request);

        //TODO - is there a role to look for?
        const userContext: UserContext = {
            ...context,
            type: ContextType.USER_CONTEXT,
            isUser: true,
        };

        return userContext;
    }

    public static async getAdminContext(request: Request): Promise<AdminContext> {
        const context = await this.get(request);

        const adminContext: AdminContext = {
            ...context,
            type: ContextType.ADMIN_CONTEXT,
            isAdmin: true,
        };

        return adminContext;
    }

    public static async getJobContext(request: Request): Promise<JobContext> {
        const context = await this.get(request);

        const jobContext: JobContext = {
            ...context,
            type: ContextType.JOB_CONTEXT,
            isJob: true,
            isAdmin: true,
        };

        return jobContext;
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
