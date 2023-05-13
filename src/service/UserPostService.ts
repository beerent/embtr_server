import { UserPost, UserPost as UserPostModel } from '@resources/schema';
import {
    CreateUserPostRequest,
    CreateUserPostResponse,
    GetAllUserPostResponse,
    GetUserPostResponse,
    UpdateUserPostRequest,
} from '@resources/types/requests/UserPostTypes';
import { GENERAL_FAILURE, RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { UserController } from '@src/controller/UserController';
import { UserPostController } from '@src/controller/UserPostController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

export class UserPostService {
    public static async create(request: Request): Promise<CreateUserPostResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const body: CreateUserPostRequest = request.body;
        body.userPost.userId = userId;

        const userPost = await UserPostController.create(body.userPost);
        const convertedUserPost: UserPostModel = ModelConverter.convert(userPost);

        return { ...SUCCESS, userPost: convertedUserPost };
    }

    public static async getAllForUser(userId: number): Promise<GetAllUserPostResponse> {
        const user = await UserController.getById(userId);
        if (!user) {
            return { ...RESOURCE_NOT_FOUND, message: 'user not found' };
        }

        const userPosts = await UserPostController.getAllForUser(userId);
        const convertedUserPostModels: UserPost[] = ModelConverter.convertAll(userPosts);
        return { ...SUCCESS, userPosts: convertedUserPostModels };
    }

    public static async getAll(request: Request): Promise<GetAllUserPostResponse> {
        const upperBound = new Date(request.query.upperBound as string);
        const lowerBound = new Date(request.query.lowerBound as string);

        const userPosts = await UserPostController.getAll(upperBound, lowerBound);
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

    public static async update(request: Request): Promise<CreateUserPostResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const body: UpdateUserPostRequest = request.body;
        body.userPost.userId = userId;

        const currentPost = await UserPostController.getById(body.userPost.id!);
        if (!currentPost) {
            return RESOURCE_NOT_FOUND;
        }

        if (currentPost.userId !== userId) {
            return RESOURCE_NOT_FOUND;
        }

        const userPost = await UserPostController.update(body.userPost);
        const convertedUserPost: UserPostModel = ModelConverter.convert(userPost);
        return { ...SUCCESS, userPost: convertedUserPost };
    }
}
