import { CREATE_USER_EMAIL_IN_USE, CREATE_USER_ERROR, CREATE_USER_INVALID_EMAIL, CREATE_USER_INVALID_PASSWORD, SUCCESS } from '@src/common/RequestResponses';
import { firebase } from './Firebase';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { logger } from '@src/common/logger/Logger';
import { CreateUserRequest, Response } from '@resources/types';

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

        //await firebase
        //    .auth()
        //    .generateEmailVerificationLink(body.email)
        //    .then((link) => {
        //        //TODO - send email
        //        logger.info('Email verification link:', link);
        //    });

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

        console.log('Creating user:', email, password);

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
