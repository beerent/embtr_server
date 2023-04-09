import { GetUserResponse, CreateUserResponse, UpdateUserRequest } from '@resources/types/requests/UserTypes';
import { Response } from '@resources/types/requests/RequestTypes';
import {
    CREATE_USER_ALREADY_EXISTS,
    CREATE_USER_FAILED,
    CREATE_USER_SUCCESS,
    GET_USER_FAILED_NOT_FOUND,
    GET_USER_SUCCESS,
    SUCCESS,
    UPDATE_USER_FAILED,
} from '@src/common/RequestResponses';
import { AccountController } from '@src/controller/AccountController';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { UserController } from '@src/controller/UserController';
import { Role } from '@src/roles/Roles';
import { Request } from 'express';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { User } from '@resources/schema';

export class UserService {
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
        const email = await AuthorizationController.getEmailFromToken(request.headers.authorization!);

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

    public static async update(request: Request): Promise<Response> {
        const body: UpdateUserRequest = request.body;

        const uid = await AuthorizationController.getUidFromToken(request.headers.authorization!);
        const email = await AuthorizationController.getEmailFromToken(request.headers.authorization!);

        if (!uid || !email) {
            return UPDATE_USER_FAILED;
        }

        body.uid = uid;
        body.email = email;

        await UserController.update(uid, { ...body });
        return SUCCESS;
    }
}
