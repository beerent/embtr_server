import {
    GetUserResponse,
    CreateUserResponse,
    UpdateUserRequest,
    GetUsersResponse,
    UpdateUserResponse,
} from '@resources/types/requests/UserTypes';
import {
    CREATE_USER_ALREADY_EXISTS,
    CREATE_USER_FAILED,
    CREATE_USER_SUCCESS,
    GET_USER_FAILED_NOT_FOUND,
    GET_USER_SUCCESS,
    SUCCESS,
    UPDATE_USER_FAILED,
    USERNAME_ALREADY_EXISTS,
} from '@src/common/RequestResponses';
import { AccountController } from '@src/controller/AccountController';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { UserController } from '@src/controller/UserController';
import { Role } from '@src/roles/Roles';
import { Request } from 'express';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { User } from '@resources/schema';
import { Prisma } from '@prisma/client';
import { logger } from '@src/common/logger/Logger';

export class UserService {
    public static async getCurrentUser(request: Request): Promise<GetUserResponse> {
        const uid = await AuthorizationController.getUidFromToken(request.headers.authorization!);
        if (!uid) {
            return GET_USER_FAILED_NOT_FOUND;
        }

        return await this.get(uid);
    }

    public static async get(uid: string): Promise<GetUserResponse> {
        const user = await UserController.getByUid(uid);
        if (user) {
            const userModel: User = ModelConverter.convert(user);
            return { ...GET_USER_SUCCESS, user: userModel };
        }

        return GET_USER_FAILED_NOT_FOUND;
    }

    public static async create(request: Request): Promise<CreateUserResponse> {
        const uid = await AuthorizationController.getUidFromToken(request.headers.authorization!);
        const email = await AuthorizationController.getEmailFromToken(
            request.headers.authorization!
        );

        if (!uid || !email) {
            return CREATE_USER_FAILED;
        }

        const user = await UserController.getByUid(uid);
        if (user) {
            return CREATE_USER_ALREADY_EXISTS;
        }

        const newUser = await UserController.create(uid, email);
        if (!newUser) {
            return CREATE_USER_FAILED;
        }

        await AccountController.updateAccountRoles(uid, [Role.USER]);
        await AccountController.updateCustomClaim(uid, 'userId', newUser.id);

        return CREATE_USER_SUCCESS;
    }

    public static async setup(request: Request): Promise<UpdateUserResponse> {
        const response = await this.update(request);
        if (response.httpCode !== 200) {
            return response;
        }

        const user = response.user;
        if (!user) {
            return UPDATE_USER_FAILED;
        }

        await this.markUserAsSetupComplete(user);
        return response;
    }

    public static async update(request: Request): Promise<UpdateUserResponse> {
        const body: UpdateUserRequest = request.body;

        const uid = await AuthorizationController.getUidFromToken(request.headers.authorization!);
        const email = await AuthorizationController.getEmailFromToken(
            request.headers.authorization!
        );

        if (!uid || !email) {
            return UPDATE_USER_FAILED;
        }

        body.uid = uid;
        body.email = email;
        delete body.accountSetup;

        if (body.username) {
            const usernameIsAvailable = await this.usernameIsAvailable(body.username, uid);
            if (!usernameIsAvailable) {
                return USERNAME_ALREADY_EXISTS;
            }
        }

        let updatedUser = undefined;
        try {
            updatedUser = await UserController.update(uid, { ...body });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                logger.info(`username ${body.username} already exists`);
                return USERNAME_ALREADY_EXISTS;
            }
        }
        if (!updatedUser) {
            return UPDATE_USER_FAILED;
        }

        const updatedUserModel: User = ModelConverter.convert(updatedUser);
        return { ...SUCCESS, user: updatedUserModel };
    }

    public static async search(query: string): Promise<GetUsersResponse> {
        const users = await UserController.search(query);
        if (users) {
            const userModels: User[] = ModelConverter.convertAll(users);
            return { ...GET_USER_SUCCESS, users: userModels };
        }

        return GET_USER_FAILED_NOT_FOUND;
    }

    private static async usernameIsAvailable(username: string, uid: string): Promise<boolean> {
        const requests = [UserController.getByUid(uid), this.getByUsername(username)];
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
        const user = await UserController.getByUsername(username);
        if (!user) {
            return null;
        }

        const userModel: User = ModelConverter.convert(user);
        return userModel;
    }

    private static async markUserAsSetupComplete(user: User) {
        const updatedUser = await UserController.update(user.uid!, {
            accountSetup: true,
        });

        return updatedUser;
    }
}
