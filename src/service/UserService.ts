import { UpdateUserRequest, UpdateUserResponse } from '@resources/types/requests/UserTypes';
import { SUCCESS, UPDATE_USER_FAILED, USERNAME_ALREADY_EXISTS } from '@src/common/RequestResponses';
import { Role } from '@src/roles/Roles';
import { Request } from 'express';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { User } from '@resources/schema';
import { Prisma } from '@prisma/client';
import { logger } from '@src/common/logger/Logger';
import { AccountDao } from '@src/database/AccountDao';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { UserDao } from '@src/database/UserDao';
import { Code } from '@resources/codes';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Context, NewUserContext } from '@src/general/auth/Context';

export class UserService {
    public static async currentUserExists(newUserContext: NewUserContext): Promise<boolean> {
        try {
            const user = await this.getByUid(newUserContext.userUid);
            return !!user;
        } catch (error) {
            return false;
        }
    }

    public static async getCurrent(context: Context): Promise<User> {
        const user = await this.getByUid(context.userUid);
        return user;
    }

    public static async get(context: Context, uid: string): Promise<User> {
        return this.getByUid(uid);
    }

    private static async getByUid(uid: string): Promise<User> {
        const user = await UserDao.getByUid(uid);
        if (user) {
            const userModel: User = ModelConverter.convert(user);
            return userModel;
        }

        throw new ServiceException(404, Code.USER_NOT_FOUND, 'user not found');
    }

    public static async create(newUserContext: NewUserContext): Promise<User> {
        const user = await UserDao.getByUid(newUserContext.userUid);
        if (user) {
            throw new ServiceException(409, Code.RESOURCE_ALREADY_EXISTS, 'user already exists');
        }

        const newUser = await UserDao.create(newUserContext.userUid, newUserContext.userEmail);
        if (!newUser) {
            throw new ServiceException(500, Code.FAILED_TO_CREATE_USER, 'failed to create user');
        }

        await AccountDao.updateAccountRoles(newUserContext.userUid, [Role.USER]);
        await AccountDao.updateCustomClaim(newUserContext.userUid, 'userId', newUser.id);

        const userModel: User = ModelConverter.convert(newUser);
        return userModel;
    }

    public static async setup(context: Context, user: User): Promise<User> {
        const setupUser = await this.update(context, user);
        await this.markUserAsSetupComplete(setupUser);

        return setupUser;
    }

    public static async update(context: Context, user: User): Promise<User> {
        if (user.uid !== context.userUid) {
            throw new ServiceException(403, Code.FORBIDDEN, 'forbidden');
        }

        const userToUpdate = { ...user };
        delete userToUpdate.accountSetup;

        if (userToUpdate.username) {
            const usernameIsAvailable = await this.usernameIsAvailable(
                userToUpdate.username,
                context.userUid
            );
            if (!usernameIsAvailable) {
                throw new ServiceException(
                    409,
                    Code.RESOURCE_ALREADY_EXISTS,
                    'username already exists'
                );
            }
        }

        let updatedUser = undefined;
        try {
            updatedUser = await UserDao.update(context.userUid, userToUpdate);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                logger.info(`username ${user.username} already exists`);
                throw new ServiceException(
                    409,
                    Code.RESOURCE_ALREADY_EXISTS,
                    'username already exists'
                );
            }
        }

        if (!updatedUser) {
            throw new ServiceException(500, Code.USER_UPDATE_FAILED, 'failed to update user');
        }

        const updatedUserModel: User = ModelConverter.convert(updatedUser);
        return updatedUserModel;
    }

    public static async search(context: Context, query: string): Promise<User[]> {
        const users = await UserDao.search(query);
        const userModels: User[] = ModelConverter.convertAll(users);

        return userModels;
    }

    public static async exists(context: Context, username: string): Promise<boolean> {
        const user = await this.getByUsername(username);
        const exists = !!user;

        return exists;
    }

    private static async usernameIsAvailable(username: string, uid: string): Promise<boolean> {
        const requests = [UserDao.getByUid(uid), this.getByUsername(username)];
        const [currentUser, targetUser] = await Promise.all(requests);
        if (!currentUser) {
            return false;
        }

        if (!targetUser) {
            return true;
        }

        if (currentUser.username === targetUser.username) {
            return true;
        }

        return false;
    }

    private static async getByUsername(username: string): Promise<User | null> {
        const user = await UserDao.getByUsername(username);
        if (!user) {
            return null;
        }

        const userModel: User = ModelConverter.convert(user);
        return userModel;
    }

    private static async markUserAsSetupComplete(user: User) {
        const updatedUser = await UserDao.update(user.uid!, {
            accountSetup: true,
        });

        return updatedUser;
    }
}
