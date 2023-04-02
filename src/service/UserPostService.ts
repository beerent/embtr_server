import { UserPost, UserPost as UserPostModel } from '@resources/schema';
import { CreateUserPostRequest, CreateUserPostResponse, GetAllUserPostResponse, GetUserPostResponse } from '@resources/types/UserPostTypes';
import { GENERAL_FAILURE, RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { UserPostController } from '@src/controller/UserPostController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

export class UserPostService {
    public static async create(request: Request): Promise<CreateUserPostResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const body: CreateUserPostRequest = request.body;
        body.userPost.userId = userId;

        const userPost = await UserPostController.create(body.userPost);
        const convertedUserPost: UserPostModel = ModelConverter.convert(userPost);
        return { ...SUCCESS, userPost: convertedUserPost };
    }

    public static async getAll(): Promise<GetAllUserPostResponse> {
        const userPosts = await UserPostController.getAll();
        const convertedUserPostModels: UserPost[] = ModelConverter.convertAll(userPosts);
        return { ...SUCCESS, userPosts: convertedUserPostModels };
    }

    public static async getById(id: number): Promise<GetUserPostResponse> {
        const userPost = await UserPostController.getById(id);

        if (userPost) {
            const convertedUserPost: UserPostModel = ModelConverter.convert(userPost);
            return { ...SUCCESS, userPost: convertedUserPost };
        }

        return RESOURCE_NOT_FOUND;
    }
}
