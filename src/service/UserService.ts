import { CreateUserResponse, GetUserResponse } from '@resources/types';
import { CREATE_USER_ALREADY_EXISTS, CREATE_USER_FAILED, CREATE_USER_SUCCESS, GET_USER_FAILED_NOT_FOUND, GET_USER_SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { UserController } from '@src/controller/UserController';
import { Request } from 'express';

export class UserService {
    public static async get(uid: string): Promise<GetUserResponse> {
        const user = await UserController.getByUid(uid);
        if (user) {
            return { ...GET_USER_SUCCESS, user: { uid: user.uid, email: user.email } };
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
        if (newUser) {
            return CREATE_USER_SUCCESS;
        }

        return CREATE_USER_FAILED;
    }
}
