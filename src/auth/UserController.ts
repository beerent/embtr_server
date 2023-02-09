import {
    CREATE_USER_EMAIL_IN_USE,
    CREATE_USER_ERROR,
    CREATE_USER_INVALID_EMAIL,
    CREATE_USER_INVALID_PASSWORD,
    RequestResponse,
    SUCCESS,
} from '@src/common/RequestResponses';
import { firebase } from './Firebase';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { logger } from '@src/common/logger/Logger';

export class UserController {
    public static async createUser(email?: string, password?: string): Promise<RequestResponse> {
        const validEmail = email !== undefined && this.isValidEmail(email);
        if (!validEmail) {
            return CREATE_USER_INVALID_EMAIL;
        }

        const validPassword = password !== undefined && this.isValidPassword(password);
        if (!validPassword) {
            return CREATE_USER_INVALID_PASSWORD;
        }

        const userExists = await this.userExists(email);
        if (userExists) {
            return CREATE_USER_EMAIL_IN_USE;
        }

        const user = await this.create(email, password);
        if (!user) {
            return CREATE_USER_ERROR;
        }

        await firebase
            .auth()
            .generateEmailVerificationLink(email)
            .then((link) => {
                //TODO - send email
                logger.info('Email verification link:', link);
            });

        return SUCCESS;
    }

    private static isValidEmail(email: string): boolean {
        const emailValidationRegEx =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return emailValidationRegEx.test(String(email).toLowerCase());
    }

    private static isValidPassword(password: string): boolean {
        return password.length > 0;
    }

    private static async userExists(email: string): Promise<boolean> {
        const user = await this.getUser(email);
        return user !== undefined;
    }

    private static async getUser(email: string): Promise<UserRecord | undefined> {
        try {
            return await firebase.auth().getUserByEmail(email);
        } catch {
            return undefined;
        }
    }

    private static async create(email: string, password: string): Promise<UserRecord | undefined> {
        let user: UserRecord | undefined = undefined;
        try {
            user = await firebase.auth().createUser({
                email,
                password,
            });

            return user;
        } catch (error) {
            logger.error('Error creating user:', error);
        }

        return undefined;
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
