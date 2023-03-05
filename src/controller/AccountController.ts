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

    public static async updateAccountRoles(uid: string, roles: Role[]): Promise<void> {
        await this.updateCustomClaim(uid, 'roles', roles);
    }

    public static async updateCustomClaim(uid: string, key: string, value: unknown): Promise<void> {
        let updatedClaims = { [key]: value };
        const currentClaims = await this.getCustomClaims(uid);
        if (currentClaims) {
            updatedClaims = { ...currentClaims, [key]: value };
        }

        try {
            await firebase.auth().setCustomUserClaims(uid, updatedClaims);
        } catch (error) {
            logger.error('Error updating user custom claims:', error);
        }
    }

    private static async getCustomClaims(uid: string): Promise<unknown> {
        try {
            const user = await firebase.auth().getUser(uid);
            const customClaims = user.customClaims;

            return customClaims;
        } catch (error) {
            logger.error('Error getting user custom claims:', error);
        }
    }
}
