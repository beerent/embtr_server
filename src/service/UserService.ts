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

export class UserService {
    public static async getCurrentUser(request: Request): Promise<User> {
        const uid = await AuthorizationDao.getUidFromToken(request.headers.authorization!);
        if (!uid) {
            throw new ServiceException(500, Code.INVALID_TOKEN, 'token in invalid state');
        }

        return await this.getByUid(uid);
    }

    public static async getByUid(uid: string): Promise<User> {
        const user = await UserDao.getByUid(uid);
        if (user) {
            const userModel: User = ModelConverter.convert(user);
            return userModel;
        }

        throw new ServiceException(404, Code.USER_NOT_FOUND, 'user not found');
    }

    public static async create(request: Request): Promise<void> {
        const uid = await AuthorizationDao.getUidFromToken(request.headers.authorization!);
        const email = await AuthorizationDao.getEmailFromToken(request.headers.authorization!);

        if (!uid || !email) {
            throw new ServiceException(500, Code.INVALID_TOKEN, 'token in invalid state');
        }

        const user = await UserDao.getByUid(uid);
        if (user) {
            throw new ServiceException(409, Code.RESOURCE_ALREADY_EXISTS, 'user already exists');
        }

        const newUser = await UserDao.create(uid, email);
        if (!newUser) {
            throw new ServiceException(500, Code.FAILED_TO_CREATE_USER, 'failed to create user');
        }

        await AccountDao.updateAccountRoles(uid, [Role.USER]);
        await AccountDao.updateCustomClaim(uid, 'userId', newUser.id);
    }

    public static async setup(request: Request): Promise<User> {
        const user = await this.update(request);
        if (!user) {
            throw new ServiceException(500, Code.USER_UPDATE_FAILED, 'failed to update user');
        }

        await this.markUserAsSetupComplete(user);
        return user;
    }

    public static async update(request: Request): Promise<User> {
        const body: UpdateUserRequest = request.body;

        const uid = await AuthorizationDao.getUidFromToken(request.headers.authorization!);
        const email = await AuthorizationDao.getEmailFromToken(request.headers.authorization!);

        if (!uid || !email) {
            throw new ServiceException(500, Code.INVALID_TOKEN, 'token in invalid state');
        }

        body.uid = uid;
        body.email = email;
        delete body.accountSetup;

        if (body.username) {
            const usernameIsAvailable = await this.usernameIsAvailable(body.username, uid);
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
            updatedUser = await UserDao.update(uid, { ...body });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                logger.info(`username ${body.username} already exists`);
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

    public static async search(query: string): Promise<User[]> {
        const users = await UserDao.search(query);
        const userModels: User[] = ModelConverter.convertAll(users);

        return userModels;
    }

    public static async exists(username: string): Promise<boolean> {
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
