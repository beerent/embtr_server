import {
    CREATE_ACCOUNT_EMAIL_IN_USE,
    CREATE_ACCOUNT_ERROR,
    CREATE_ACCOUNT_INVALID_EMAIL,
    CREATE_ACCOUNT_INVALID_PASSWORD,
    FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL,
    SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL,
    SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS,
    SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL,
    ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS,
    SUCCESS,
    GENERAL_FAILURE,
    HttpCode,
} from '@src/common/RequestResponses';
import { Code } from '@resources/codes';
import { firebase } from '@src/auth/Firebase';
import {
    CreateAccountRequest,
    ForgotAccountPasswordRequest,
    VerifyAccountEmailRequest,
} from '@resources/types/requests/AccountTypes';
import {
    AuthenticationRequest,
    AuthenticationResponse,
    Response,
} from '@resources/types/requests/RequestTypes';
import { logger } from '@src/common/logger/Logger';
import { Request } from 'express';
import { TokenCache } from '@src/general/auth/TokenCache';
import { CreateAccountResult, AccountDao } from '@src/database/AccountDao';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { EmailDao } from '@src/database/EmailDao';
import { UserDao } from '@src/database/UserDao';
import { Context } from '@src/general/auth/Context';
import { Roles } from '@src/roles/Roles';
import { Role } from '@src/roles/Roles';
import { ServiceException } from '@src/general/exception/ServiceException';

interface EmailVerificationLink {
    link: string;
    error?: string;
}

export class AccountService {
    public static async get(context: Context, email: string) {
        //const isAdmin = Roles.isAdmin(context.userRoles);
        //if (!isAdmin) {
        //    throw new ServiceException(HttpCode.FORBIDDEN, Code.FORBIDDEN, 'forbidden');
        //}

        const account = await AccountDao.getByEmail(email);
        if (!account) {
            // todo - make this accountnotfound not usernotfound
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.USER_NOT_FOUND,
                'account not found'
            );
        }

        return account;
    }

    public static async create(request: CreateAccountRequest): Promise<Response> {
        if (!request.email || !request.password) {
            return CREATE_ACCOUNT_ERROR;
        }

        const result: CreateAccountResult = await AccountDao.create(
            request.email,
            request.password
        );
        if (result.code !== Code.SUCCESS) {
            return this.getFailureResponse(result);
        }

        const emailVerificationLink = await this.getEmailVerificationLink(request.email);
        if (emailVerificationLink.error) {
            return CREATE_ACCOUNT_ERROR;
        }

        await this.sendEmailVerificationEmail(request.email, emailVerificationLink);
        return SUCCESS;
    }

    public static async forgotPassword(request: ForgotAccountPasswordRequest): Promise<Response> {
        if (!request.email) {
            return FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL;
        }

        await this.sendForgotPasswordEmail(request.email);
        return SUCCESS;
    }

    public static async sendVerificationEmail(
        request: VerifyAccountEmailRequest
    ): Promise<Response> {
        if (!request.email) {
            return SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL;
        }

        const user = await AccountDao.getByEmail(request.email);
        if (!user) {
            return SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL;
        }

        const emailVerificationLink = await this.getEmailVerificationLink(request.email);
        if (emailVerificationLink.error) {
            return SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS;
        }

        await this.sendEmailVerificationEmail(request.email, emailVerificationLink);

        return SUCCESS;
    }

    public static async emailIsVerified(email: string): Promise<boolean> {
        const user = await AccountDao.getByEmail(email);
        if (!user) {
            return false;
        }

        return user.emailVerified;
    }

    public static async manuallyVerifyEmail(email: string): Promise<void> {
        await AccountDao.verifyEmail(email);
    }

    public static async authenticate(
        request: AuthenticationRequest
    ): Promise<AuthenticationResponse> {
        if (!request.email || !request.password) {
            return ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS;
        }

        const idToken = await AuthenticationDao.generateValidIdToken(
            request.email,
            request.password
        );
        if (!idToken) {
            return ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS;
        }

        return { ...SUCCESS, token: idToken };
    }

    public static async refreshToken(req: Request) {
        const uid = await AuthorizationDao.getUidFromToken(req.headers.authorization!);
        if (!uid) {
            return { ...GENERAL_FAILURE, message: 'failed to refresh token' };
        }

        await AccountDao.updateCustomClaim(uid, 'userId', undefined);

        const user = await UserDao.getByUid(uid);
        if (!user) {
            return { ...GENERAL_FAILURE, message: 'failed to refresh token' };
        }

        await AccountDao.updateCustomClaim(uid, 'userId', user.id);
        await TokenCache.invalidateToken(req.headers.authorization!);

        return { ...SUCCESS };
    }

    public static async delete(context: Context): Promise<Response> {
        const user = await AccountDao.getByUid(context.userUid);
        if (!user) {
            return { ...GENERAL_FAILURE, message: 'failed to delete account' };
        }

        await EmailDao.sendEmail(
            user.email ?? '',
            'Embtr Account Deleted',
            'We sorry to see you go! Your account and all of your data has been deleted. If ever want to come back, you can create a new account.'
        );

        await AccountDao.delete(context.userEmail);
        await UserDao.deleteByEmail(context.userEmail);

        return { ...SUCCESS };
    }

    public static async deleteByEmail(email: string): Promise<Response> {
        const user = await AccountDao.getByEmail(email);
        if (!user) {
            return { ...GENERAL_FAILURE, message: 'failed to delete account' };
        }

        await AccountDao.delete(user.email);

        return { ...SUCCESS };
    }

    public static async upgradeToAdmin(context: Context, email: string) {
        if (!Roles.isAdmin(context.userRoles)) {
            throw new ServiceException(HttpCode.FORBIDDEN, Code.FORBIDDEN, 'forbidden');
        }

        AccountDao.updateAccountRoles(email, [Role.ADMIN]);
    }

    public static async revokeToken(email: string) {
        const account = await AccountDao.getByEmail(email);
        if (!account) {
            return;
        }

        await firebase.auth().revokeRefreshTokens(account.uid);
    }

    private static getFailureResponse(result: CreateAccountResult): Response {
        switch (result.code) {
            case Code.CREATE_ACCOUNT_INVALID_EMAIL:
                return CREATE_ACCOUNT_INVALID_EMAIL;

            case Code.CREATE_ACCOUNT_INVALID_PASSWORD:
                return CREATE_ACCOUNT_INVALID_PASSWORD;

            case Code.CREATE_ACCOUNT_EMAIL_IN_USE:
                return CREATE_ACCOUNT_EMAIL_IN_USE;
        }

        return CREATE_ACCOUNT_ERROR;
    }

    private static async getEmailVerificationLink(email: string): Promise<EmailVerificationLink> {
        try {
            const link = await firebase.auth().generateEmailVerificationLink(email);
            return { link };
        } catch (error) {
            //@ts-ignore :(
            const x = error!.message;
            //@ts-ignore :(
            if (error.message.includes('TOO_MANY_ATTEMPTS')) {
                return { link: '', error: 'too many attempts' };
            }
        }

        return { link: '', error: 'unknown error' };
    }

    private static async sendEmailVerificationEmail(
        email: string,
        link: EmailVerificationLink
    ): Promise<EmailVerificationLink> {
        const subject = 'Verify your email';
        const text = `Please click the link to verify your email: ${link.link}`;

        await EmailDao.sendEmail(email, subject, text);

        return link;
    }

    private static async sendForgotPasswordEmail(email: string): Promise<void> {
        const link = await this.getForgotPasswordLink(email);
        if (!link) {
            return;
        }

        const subject = 'Reset your password';
        const text = `Dear ${email}\n\nPlease click the link to reset your password: ${link}. If you did not request a password reset, you are safe to ignore this email.`;

        await EmailDao.sendEmail(email, subject, text);
    }

    private static async getForgotPasswordLink(email: string): Promise<string | undefined> {
        try {
            return await firebase.auth().generatePasswordResetLink(email);
        } catch (error) {
            logger.log('info', error);
        }

        return undefined;
    }
}
