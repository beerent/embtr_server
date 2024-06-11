import { Role } from '@src/roles/Roles';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { User } from '@resources/schema';
import { Prisma } from '@prisma/client';
import { logger } from '@src/common/logger/Logger';
import { AccountDao } from '@src/database/AccountDao';
import { UserDao } from '@src/database/UserDao';
import { Code } from '@resources/codes';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Context, NewUserContext } from '@src/general/auth/Context';
import { AccountService } from '@src/service/AccountService';
import { ApiAlertsService } from '@src/service/ApiAlertsService';
import { BlockUserService } from './BlockUserService';
import { UserRoleService } from '@src/service/UserRoleService';
import { ImageDetectionService } from './ImageService';
import { RevenueCatService } from './internal/RevenueCatService';
import { Constants } from '@resources/types/constants/constants';
import { UserPropertyService } from './UserPropertyService';
import { HttpCode } from '@src/common/RequestResponses';
import { PremiumMembershipService } from './feature/PremiumMembershipService';

export class UserService {
    public static async currentUserExists(newUserContext: NewUserContext): Promise<boolean> {
        try {
            const user = await this.getByUid(newUserContext.userUid);
            return !!user;
        } catch (error) {
            return false;
        }
    }

    public static async getCurrent(newUserContext: NewUserContext): Promise<User | undefined> {
        const user = await this.getByUid(newUserContext.userUid);
        return user;
    }

    public static async get(context: Context, uid: string): Promise<User | undefined> {
        return this.getByUid(uid);
    }

    public static async getAll(context: Context, query?: Record<string, string>): Promise<User[]> {
        const users = await UserDao.getAll(query);
        const userModels: User[] = ModelConverter.convertAll(users);

        return userModels;
    }

    public static async getAllUserCount(context: Context): Promise<number> {
        const count = await UserDao.getAllUserCount();

        return count;
    }

    public static async getAllPremiumUserCount(context: Context): Promise<number> {
        const count = await UserDao.getAllPremiumUserCount();

        return count;
    }

    public static async getAllPremium(context: Context): Promise<User[]> {
        const users = await UserDao.getUsersWithRole(Role.PREMIUM);
        const userModels: User[] = ModelConverter.convertAll(users);

        return userModels;
    }

    public static async getByEmail(email: string): Promise<User> {
        const user = await UserDao.getByEmail(email);
        if (!user) {
            throw new ServiceException(404, Code.USER_NOT_FOUND, 'user not found');
        }

        const userModel: User = ModelConverter.convert(user);
        return userModel;
    }

    public static async create(newUserContext: NewUserContext): Promise<User> {
        const user = await UserDao.getByUid(newUserContext.userUid);
        if (user) {
            logger.error('failed to create user - user already exists');
            throw new ServiceException(409, Code.RESOURCE_ALREADY_EXISTS, 'user already exists');
        }

        const emailIsVerified = await AccountService.emailIsVerified(newUserContext.userEmail);
        if (!emailIsVerified) {
            logger.error('failed to create user - email is not verified');
            throw new ServiceException(403, Code.EMAIL_NOT_VERIFIED, 'email is not verified');
        }

        const newUser = await UserDao.create(newUserContext.userUid, newUserContext.userEmail);
        if (!newUser) {
            logger.error('failed to create user - database error');
            throw new ServiceException(500, Code.FAILED_TO_CREATE_USER, 'failed to create user');
        }
        logger.info('created new user', newUser.id);

        await UserRoleService.addUserRoles(newUserContext, newUser.email, [Role.USER, Role.FREE]);
        await AccountDao.updateCustomClaim(newUserContext.userUid, 'userId', newUser.id);

        const userModel: User = ModelConverter.convert(newUser);
        return userModel;
    }

    public static async setup(context: Context, user: User): Promise<User> {
        const setupUser = await this.update(context, user);
        await this.markUserAsSetupComplete(context, setupUser);

        if (setupUser.id) {
            await UserPropertyService.setDefaultProperties(context, setupUser.id);
        }

        ApiAlertsService.sendAlert(`New user created!`);

        return setupUser;
    }

    public static async update(context: Context, user: User): Promise<User> {
        if (user.uid !== context.userUid) {
            logger.error('failed to update user - forbidden');
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

        if (userToUpdate.photoUrl) {
            userToUpdate.photoUrl = await ImageDetectionService.filterUrlImage(
                userToUpdate.photoUrl
            );
        }

        let updatedUser = undefined;
        try {
            updatedUser = await UserDao.update(context.userUid, userToUpdate);
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                logger.warn(`username ${user.username} already exists`);
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
        const blockedUserIds = await BlockUserService.getBlockedAndBlockedByUserIds(context);
        const filteredUsers = users.filter((user) => !blockedUserIds.includes(user.id));
        const userModels: User[] = ModelConverter.convertAll(filteredUsers);

        return userModels;
    }

    public static async refreshPremiumUsers(context: Context) {
        const users = await this.getAllPremium(context);
        logger.info(`found ${users.length} premium users`);

        for (const user of users) {
            if (!user.uid) {
                continue;
            }

            console.log('checking premium status for', user.username);
            await this.updatePremiumStatus(context, user.uid);
        }
    }

    public static async updatePremiumStatus(context: Context, uid: string) {
        const account = await AccountDao.getByUid(uid);
        if (!account?.email || !account.customClaims?.userId) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.USER_NOT_FOUND,
                'user not found'
            );
        }

        const isPremium = await RevenueCatService.isPremium(uid);
        const hasPremiumRole = await this.isPremium(context, account.customClaims.userId);
        if (isPremium) {
            if (!hasPremiumRole) {
                await PremiumMembershipService.addPremium(context, account.email);
            }
        } else {
            if (hasPremiumRole) {
                await PremiumMembershipService.removePremium(context, account.email);
            }
        }

        const user = await this.getByUid(uid);
        return user;
    }

    public static async isPremium(context: Context, userId: number): Promise<boolean> {
        const isPremium = await UserRoleService.hasPremiumRole(context, userId);
        return isPremium;
    }

    public static async exists(context: Context, username: string): Promise<boolean> {
        const user = await this.getByUsername(username);
        const exists = !!user;

        return exists;
    }

    public static async deleteByEmail(email: string): Promise<void> {
        await UserDao.deleteByEmail(email);
    }

    public static async existsByEmail(email: string): Promise<boolean> {
        const exists = UserDao.existsByEmail(email);
        return exists;
    }

    public static async existsByUid(uid: string): Promise<boolean> {
        const exists = UserDao.existsByUid(uid);
        return exists;
    }

    public static async existsByUsername(username: string): Promise<boolean> {
        const exists = UserDao.existsByUsername(username);
        return exists;
    }

    public static async existsById(id: number): Promise<boolean> {
        const exists = UserDao.existsById(id);
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

    public static async getByUsername(username: string): Promise<User | null> {
        const user = await UserDao.getByUsername(username);
        if (!user) {
            return null;
        }

        const userModel: User = ModelConverter.convert(user);
        return userModel;
    }

    public static async getUsersWithProperty(
        context: Context,
        key: Constants.UserPropertyKey,
        value: string
    ): Promise<User[]> {
        const users = await UserDao.getUsersWithProperty(key, value);
        const userModels: User[] = ModelConverter.convertAll(users);

        return userModels;
    }

    public static async getUsersWithoutProperty(
        context: Context,
        key: Constants.UserPropertyKey
    ): Promise<User[]> {
        const users = await UserDao.getUsersWithoutProperty(key);
        const userModels: User[] = ModelConverter.convertAll(users);

        return userModels;
    }

    private static async markUserAsSetupComplete(context: Context, user: User) {
        const updatedUser = await UserDao.update(user.uid!, {
            accountSetup: true,
        });

        return updatedUser;
    }

    private static async getByUid(uid: string): Promise<User | undefined> {
        const user = await UserDao.getByUid(uid);

        if (user) {
            const userModel: User = ModelConverter.convert(user);
            return userModel;
        } else {
            throw new ServiceException(404, Code.USER_NOT_FOUND, 'user not found');
        }
    }

    public static async getByIdForAdmin(id: number): Promise<User | undefined> {
        const user = await UserDao.getByIdForAdmin(id)
        if (user) {
          return user as User;
        } else {
            throw new ServiceException(404, Code.USER_NOT_FOUND, 'user not found');
        }
    }
}
