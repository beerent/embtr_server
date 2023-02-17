import { Response, CreateUserRequest, ForgotPasswordRequest, VerifyEmailRequest } from '@resources/types';
import {
    CREATE_USER_EMAIL_IN_USE,
    CREATE_USER_ERROR,
    CREATE_USER_INVALID_EMAIL,
    CREATE_USER_INVALID_PASSWORD,
    FORGOT_PASSWORD_INVALID_EMAIL,
    FORGOT_PASSWORD_UNKNOWN_EMAIL,
    SEND_VERIFICATION_EMAIL_INVALID_EMAIL,
    SEND_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS,
    SEND_VERIFICATION_EMAIL_UNKNOWN_EMAIL,
    SUCCESS,
} from '@src/common/RequestResponses';
import { Code } from '@resources/codes';
import { CreateUserResult, UserController } from '@src/controller/UserController';
import { firebase } from '@src/auth/Firebase';
import { EmailController } from '@src/controller/EmailController';

interface EmailVerificationLink {
    link: string;
    error?: string;
}

export class UserService {
    public static async create(request: CreateUserRequest): Promise<Response> {
        if (!request.email || !request.password) {
            return this.getInvalidRequestResponse(request);
        }

        const result: CreateUserResult = await UserController.create(request.email, request.password);
        if (result.code !== Code.SUCCESS) {
            return this.getFailureResponse(result);
        }

        const emailVerificationLink = await this.getEmailVerificationLink(request.email);
        if (emailVerificationLink.error) {
            return CREATE_USER_ERROR;
        }

        await this.sendEmailVerificationEmail(request.email, emailVerificationLink);
        return SUCCESS;
    }

    public static async forgotPassword(request: ForgotPasswordRequest): Promise<Response> {
        if (!request.email) {
            return FORGOT_PASSWORD_INVALID_EMAIL;
        }

        const user = await UserController.get(request.email);
        if (!user) {
            return FORGOT_PASSWORD_UNKNOWN_EMAIL;
        }

        await this.sendForgotPasswordEmail(request.email);
        return SUCCESS;
    }

    public static async sendVerificationEmail(request: VerifyEmailRequest): Promise<Response> {
        if (!request.email) {
            return SEND_VERIFICATION_EMAIL_INVALID_EMAIL;
        }

        const user = await UserController.get(request.email);
        if (!user) {
            return SEND_VERIFICATION_EMAIL_UNKNOWN_EMAIL;
        }

        const emailVerificationLink = await this.getEmailVerificationLink(request.email);
        if (emailVerificationLink.error) {
            return SEND_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS;
        }

        await this.sendEmailVerificationEmail(request.email, emailVerificationLink);

        return SUCCESS;
    }

    private static getInvalidRequestResponse(request: CreateUserRequest): Response {
        if (!request.email) {
            return CREATE_USER_INVALID_EMAIL;
        }

        return CREATE_USER_INVALID_PASSWORD;
    }

    private static getFailureResponse(result: CreateUserResult): Response {
        switch (result.code) {
            case Code.CREATE_USER_INVALID_EMAIL:
                return CREATE_USER_INVALID_EMAIL;

            case Code.CREATE_USER_INVALID_PASSWORD:
                return CREATE_USER_INVALID_PASSWORD;

            case Code.CREATE_USER_EMAIL_IN_USE:
                return CREATE_USER_EMAIL_IN_USE;
        }

        return CREATE_USER_ERROR;
    }

    private static async getEmailVerificationLink(email: string): Promise<EmailVerificationLink> {
        try {
            const link = await firebase.auth().generateEmailVerificationLink(email);
            return { link };
        } catch (error) {
            //@ts-ignore :(
            if (error.message.includes('TOO MANY ATTEMPTS')) {
                return { link: '', error: 'too many attempts' };
            }
        }

        return { link: '', error: 'unknown error' };
    }

    private static async sendEmailVerificationEmail(email: string, link: EmailVerificationLink): Promise<EmailVerificationLink> {
        const subject = 'Verify your email';
        const text = `Please click the link to verify your email: ${link.link}`;

        await EmailController.sendEmail(email, subject, text);

        return link;
    }

    private static async sendForgotPasswordEmail(email: string): Promise<void> {
        const link = await firebase.auth().generatePasswordResetLink(email);
        const subject = 'Reset your password';
        const text = `Please click the link to reset your password: ${link}. If you did not request a password reset, you are safe to ignore this email.`;

        await EmailController.sendEmail(email, subject, text);
    }
}
