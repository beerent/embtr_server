import {
    CREATE_ACCOUNT_EMAIL_IN_USE,
    CREATE_ACCOUNT_ERROR,
    CREATE_ACCOUNT_INVALID_EMAIL,
    CREATE_ACCOUNT_INVALID_PASSWORD,
    FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL,
    FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL,
    SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL,
    SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS,
    SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL,
    ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS,
    SUCCESS,
} from '@src/common/RequestResponses';
import { Code } from '@resources/codes';
import { CreateAccountResult, AccountController } from '@src/controller/AccountController';
import { firebase } from '@src/auth/Firebase';
import { EmailController } from '@src/controller/EmailController';
import { AuthenticationController } from '@src/controller/AuthenticationController';
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

interface EmailVerificationLink {
    link: string;
    error?: string;
}

export class AccountService {
    public static async create(request: CreateAccountRequest): Promise<Response> {
        if (!request.email || !request.password) {
            return this.getInvalidRequestResponse(request);
        }

        const result: CreateAccountResult = await AccountController.create(
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

        const user = await AccountController.get(request.email);
        if (!user) {
            return FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL;
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

        const user = await AccountController.get(request.email);
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

    public static async authenticate(
        request: AuthenticationRequest
    ): Promise<AuthenticationResponse> {
        if (!request.email || !request.password) {
            return ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS;
        }

        const idToken = await AuthenticationController.generateValidIdToken(
            request.email,
            request.password
        );
        if (!idToken) {
            return ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS;
        }

        return { ...SUCCESS, token: idToken };
    }

    private static getInvalidRequestResponse(request: CreateAccountRequest): Response {
        if (!request.email) {
            return CREATE_ACCOUNT_INVALID_EMAIL;
        }

        return CREATE_ACCOUNT_INVALID_PASSWORD;
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

        await EmailController.sendEmail(email, subject, text);

        return link;
    }

    private static async sendForgotPasswordEmail(email: string): Promise<void> {
        const link = await firebase.auth().generatePasswordResetLink(email);
        const subject = 'Reset your password';
        const text = `Dear ${email}\n\nPlease click the link to reset your password: ${link}. If you did not request a password reset, you are safe to ignore this email.`;

        await EmailController.sendEmail(email, subject, text);
    }
}
