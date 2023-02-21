import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { logger } from '@src/common/logger/Logger';
import { firebase } from '@src/auth/Firebase';
import { Code } from '@resources/codes';
import { Role } from '@src/roles/Roles';

export interface CreateAccountResult {
    user: UserRecord | undefined;
    code: Code;
}

export class AccountController {
    public static async create(email: string, password: string): Promise<CreateAccountResult> {
        let user: UserRecord | undefined = undefined;
        try {
            user = await firebase.auth().createUser({
                email,
                password,
            });

            return {
                user,
                code: Code.SUCCESS,
            };
        } catch (error) {
            // @ts-ignore :(
            const code = error.errorInfo.code;
            logger.error('Error creating user:', code);

            switch (code) {
                case 'auth/email-already-exists':
                    return { user: undefined, code: Code.CREATE_ACCOUNT_EMAIL_IN_USE };
                case 'auth/invalid-email':
                    return { user: undefined, code: Code.CREATE_ACCOUNT_INVALID_EMAIL };
                case 'auth/invalid-password':
                    return { user: undefined, code: Code.CREATE_ACCOUNT_INVALID_PASSWORD };
            }
        }

        return { user: undefined, code: Code.GENERIC_ERROR };
    }

    public static async delete(email?: string): Promise<void> {
        if (!email) {
            return;
        }

        const account = await this.get(email);
        if (account) {
            await firebase.auth().deleteUser(account.uid);
        }
    }

    public static async get(email: string): Promise<UserRecord | undefined> {
        try {
            const user = await firebase.auth().getUserByEmail(email);
            return user;
        } catch (error) {
            return undefined;
        }
    }

    public static async updateAccountRoles(userRecord: UserRecord, roles: Role[]): Promise<void> {
        try {
            await firebase.auth().setCustomUserClaims(userRecord.uid, { roles });
        } catch (error) {
            logger.error('Error updating user roles:', error);
        }
    }
}
