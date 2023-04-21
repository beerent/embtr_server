import { User } from '@prisma/client';
import { AccountController } from '@src/controller/AccountController';
import { UserController } from '@src/controller/UserController';
import { Role } from '@src/roles/Roles';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { authenticate } from '@src/middleware/authentication';
import { Request, Response } from 'express';
import { AuthenticationController } from '@src/controller/AuthenticationController';

export interface TestAccountWithoutUser {
    account: UserRecord;
    token: string;
}

export interface TestAccountWithUser {
    account: UserRecord;
    user: User;
    token: string;
}

export class TestUtility {
    public static async createAccountWithoutUser(
        email: string,
        password: string,
        role: Role
    ): Promise<TestAccountWithoutUser> {
        const account = await AccountController.create(email, password);
        await AccountController.updateAccountRoles(account.user!.uid, [role]);
        const token = await AuthenticationController.generateValidIdToken(email, password);

        await this.sendAuthRequest(token);

        const updatedToken = await AuthenticationController.generateValidIdToken(email, password);

        return { account: account.user!, token: updatedToken };
    }

    public static async createAccountWithUser(
        email: string,
        password: string,
        role: Role
    ): Promise<TestAccountWithUser> {
        const account = await AccountController.create(email, password);
        const user = await UserController.create(account.user!.uid, email);

        await AccountController.updateAccountRoles(account.user!.uid, [role]);
        const token = await AuthenticationController.generateValidIdToken(email, password);

        await this.sendAuthRequest(token);

        const updatedToken = await AuthenticationController.generateValidIdToken(email, password);

        if (user !== null) {
            return { account: account.user!, user, token: updatedToken };
        }

        throw new Error('Failed to create user');
    }

    public static async deleteAccountWithoutUser(email: string): Promise<void> {
        const deletes = [AccountController.delete(email)];
        await Promise.all(deletes);
    }

    public static async deleteAccountWithUser(email: string): Promise<void> {
        const deletes = [AccountController.delete(email), UserController.deleteByEmail(email)];
        await Promise.all(deletes);
    }

    public static async sendAuthRequest(token: string) {
        const next = jest.fn();

        const request = {
            headers: {
                authorization: `Bearer ${token}`,
            },
        } as Request;

        const response = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        } as unknown as Response;

        await authenticate(request, response, next);

        return response;
    }
}
