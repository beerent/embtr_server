import { User } from '@prisma/client';
import { Role } from '@src/roles/Roles';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { authenticate } from '@src/middleware/authentication';
import { Request, Response } from 'express';
import { AccountDao } from '@src/database/AccountDao';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { UserDao } from '@src/database/UserDao';
import { AccountService } from '@src/service/AccountService';
import { UserService } from '@src/service/UserService';

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
        const account = await AccountDao.create(email, password);
        await AccountDao.updateAccountRoles(account.user!.uid, [role]);
        const token = await AuthenticationDao.generateValidIdToken(email, password);

        await this.sendAuthRequest(token);

        const updatedToken = await AuthenticationDao.generateValidIdToken(email, password);

        return { account: account.user!, token: updatedToken };
    }

    public static async createAccountWithUser(
        email: string,
        password: string,
        role: Role
    ): Promise<TestAccountWithUser> {
        const account = await AccountDao.create(email, password);
        const user = await UserDao.create(account.user!.uid, email);

        await AccountDao.updateAccountRoles(account.user!.uid, [role]);
        await AccountDao.updateCustomClaim(account.user!.uid, 'userId', user?.id!);
        const token = await AuthenticationDao.generateValidIdToken(email, password);

        await this.sendAuthRequest(token);

        const updatedToken = await AuthenticationDao.generateValidIdToken(email, password);

        if (user !== null) {
            return { account: account.user!, user, token: updatedToken };
        }

        throw new Error('Failed to create user');
    }

    public static async deleteAccountWithoutUser(email: string): Promise<void> {
        const deletes = [AccountDao.delete(email)];
        await Promise.all(deletes);
    }

    public static async deleteAccountWithUser(email: string): Promise<void> {
        const promises = [];
        const accountExists = await AccountService.existsByEmail(email);
        if (accountExists) {
            promises.push(AccountDao.delete(email));
        }

        const userExists = await UserService.existsByEmail(email);
        if (userExists) {
            promises.push(UserDao.deleteByEmail(email));
        }

        await Promise.all(promises);
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
