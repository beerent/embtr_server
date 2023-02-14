import {
    CREATE_USER_EMAIL_IN_USE,
    CREATE_USER_ERROR,
    CREATE_USER_INVALID_EMAIL,
    CREATE_USER_INVALID_PASSWORD,
    FORGOT_PASSWORD_INVALID_EMAIL,
    FORGOT_PASSWORD_UNKNOWN_EMAIL,
    SUCCESS,
} from '@src/common/RequestResponses';
import { firebase } from './Firebase';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { logger } from '@src/common/logger/Logger';
import { CreateUserRequest, ForgotPasswordRequest, Response } from '@resources/types';
import { EmailController } from '@src/notifications/email/EmailController';

interface CreateUserResult {
    user: UserRecord | undefined;
    response: Response;
}

export class UserController {
    public static async createUser(body: CreateUserRequest): Promise<Response> {
        const createResponse = await this.create(body.email, body.password);
        if (createResponse.response !== SUCCESS) {
            return createResponse.response;
        }

        await this.sendVerificationEmail(body.email);
        return SUCCESS;
    }

    public static async forgotPassword(body: ForgotPasswordRequest): Promise<Response> {
        if (!body.email) {
            return FORGOT_PASSWORD_INVALID_EMAIL;
        }

        const user = await this.getUser(body.email);
        if (!user) {
            return FORGOT_PASSWORD_UNKNOWN_EMAIL;
        }

        await this.sendForgotPasswordEmail(body.email);
        return SUCCESS;
    }

    private static async getUser(email: string): Promise<UserRecord | undefined> {
        try {
            return await firebase.auth().getUserByEmail(email);
        } catch {
            return undefined;
        }
    }

    private static async create(email: string, password: string): Promise<CreateUserResult> {
        if (!email) {
            return { user: undefined, response: CREATE_USER_INVALID_EMAIL };
        }

        if (!password) {
            return { user: undefined, response: CREATE_USER_INVALID_PASSWORD };
        }

        let user: UserRecord | undefined = undefined;
        try {
            user = await firebase.auth().createUser({
                email,
                password,
            });

            return {
                user,
                response: SUCCESS,
            };
        } catch (error) {
            // @ts-ignore :(
            const code = error.errorInfo.code;
            logger.error('Error creating user:', code);

            switch (code) {
                case 'auth/email-already-exists':
                    return { user: undefined, response: CREATE_USER_EMAIL_IN_USE };
                case 'auth/invalid-email':
                    return { user: undefined, response: CREATE_USER_INVALID_EMAIL };
                case 'auth/invalid-password':
                    return { user: undefined, response: CREATE_USER_INVALID_PASSWORD };
            }
        }

        return { user: undefined, response: CREATE_USER_ERROR };
    }

    private static async sendVerificationEmail(email: string): Promise<void> {
        const link = await firebase.auth().generateEmailVerificationLink(email);
        const subject = 'Verify your email';
        const text = `Please click the link to verify your email: ${link}`;

        await EmailController.sendEmail(email, subject, text);
    }

    private static async sendForgotPasswordEmail(email: string): Promise<void> {
        const link = await firebase.auth().generatePasswordResetLink(email);
        const subject = 'Reset your password';
        const text = `Please click the link to reset your password: ${link}. If you did not request a password reset, you are safe to ignore this email.`;

        await EmailController.sendEmail(email, subject, text);
    }

    public static async deleteUser(email?: string): Promise<void> {
        if (email === undefined) {
            return;
        }

        const user = await this.getUser(email);
        if (user) {
            await firebase.auth().deleteUser(user.uid);
        }
    }
}
