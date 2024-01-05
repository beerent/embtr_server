import { User } from '@resources/schema';
import { GetBooleanResponse } from '@resources/types/requests/GeneralTypes';
import {
    CreateUserResponse,
    GetUserResponse,
    GetUsersResponse,
    UpdateUserResponse,
} from '@resources/types/requests/UserTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { UserService } from '@src/service/UserService';
import { Request } from 'express';

export class UserController {
    public static async search(query: string): Promise<GetUsersResponse> {
        const users: User[] = await UserService.search(query);
        return { ...SUCCESS, users };
    }

    public static async exists(username: string): Promise<GetBooleanResponse> {
        const exists = await UserService.exists(username);
        return { ...SUCCESS, result: exists };
    }

    public static async getByUid(uid: string): Promise<GetUserResponse> {
        const user = await UserService.getByUid(uid);
        return { ...SUCCESS, user: user };
    }

    public static async getCurrentUser(request: Request): Promise<GetUserResponse> {
        const user = await UserService.getCurrentUser(request);
        return { ...SUCCESS, user: user };
    }

    public static async create(request: Request): Promise<CreateUserResponse> {
        await UserService.create(request);
        return SUCCESS;
    }

    public static async update(request: Request): Promise<UpdateUserResponse> {
        const user = await UserService.update(request);
        return { ...SUCCESS, user: user };
    }

    public static async setup(request: Request): Promise<UpdateUserResponse> {
        const user = await UserService.setup(request);
        return { ...SUCCESS, user: user };
    }
}
