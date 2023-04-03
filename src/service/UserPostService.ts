import { Like as LikeModel, UserPost, UserPost as UserPostModel } from '@resources/schema';
import { Response } from '@resources/types/RequestTypes';
import { CreateUserPostRequest, CreateUserPostResponse, GetAllUserPostResponse, GetUserPostResponse } from '@resources/types/UserPostTypes';
import { GENERAL_FAILURE, RESOURCE_ALREADY_EXISTS, RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { UserPostController } from '@src/controller/UserPostController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';
import { NotificationService, NotificationType } from './NotificationService';

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

    public static async update(request: Request): Promise<CreateUserPostResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const body: CreateUserPostRequest = request.body;
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

    public static async createLike(request: Request): Promise<Response> {
        const userPostId = Number(request.params.id);

        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const userPost = await UserPostController.getById(userPostId);
        if (!userPost) {
            return { ...RESOURCE_NOT_FOUND, message: 'post not found' };
        }

        const userAlreadyLiked = userPost.likes?.some((like) => like.userId === userId);
        if (userAlreadyLiked) {
            return { ...RESOURCE_ALREADY_EXISTS, message: 'user already liked post' };
        }

        const userPostModel: UserPostModel = ModelConverter.convert(userPost);
        const likeModel: LikeModel = { userId };
        userPostModel.likes = userPostModel.likes ? [...userPostModel.likes, likeModel] : [likeModel];

        const result = await UserPostController.update(userPostModel);
        if (result) {
            await NotificationService.createNotification(userPost.userId, userId, NotificationType.TIMELINE_LIKE, userPost.id);
            return SUCCESS;
        }

        return { ...GENERAL_FAILURE, message: 'an unknown error occured' };
    }
}
