import { UserPost, UserPost as UserPostModel } from '@resources/schema';
import {
    CreateUserPostRequest,
    CreateUserPostResponse,
    GetAllUserPostResponse,
    GetUserPostResponse,
    UpdateUserPostRequest,
} from '@resources/types/requests/UserPostTypes';
import { GENERAL_FAILURE, RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';
import { ImageDetectionService } from './ImageService';
import { UserPostDao } from '@src/database/UserPostDao';
import { UserDao } from '@src/database/UserDao';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { ImageDao } from '@src/database/ImageDao';

export class UserPostService {
    public static async create(request: Request): Promise<CreateUserPostResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const body: CreateUserPostRequest = request.body;
        body.userPost.userId = userId;

        const filteredImageResults = await ImageDetectionService.filterImages(
            body.userPost.images ?? []
        );

        body.userPost.images = filteredImageResults.clean;
        await ImageDao.deleteImages(filteredImageResults.adult);

        const userPost = await UserPostDao.create(body.userPost);
        const convertedUserPost: UserPostModel = ModelConverter.convert(userPost);

        return { ...SUCCESS, userPost: convertedUserPost };
    }

    public static async getAllForUser(userId: number): Promise<GetAllUserPostResponse> {
        const user = await UserDao.getById(userId);
        if (!user) {
            return { ...RESOURCE_NOT_FOUND, message: 'user not found' };
        }

        const userPosts = await UserPostDao.getAllForUser(userId);
        const convertedUserPostModels: UserPost[] = ModelConverter.convertAll(userPosts);
        return { ...SUCCESS, userPosts: convertedUserPostModels };
    }

    public static async getAllByIds(ids: number[]): Promise<GetAllUserPostResponse> {
        if (ids.length === 0) {
            return { ...SUCCESS, userPosts: [] };
        }

        const userPosts = await UserPostDao.getAllInIds(ids);
        const convertedUserPostModels: UserPost[] = ModelConverter.convertAll(userPosts);

        return { ...SUCCESS, userPosts: convertedUserPostModels };
    }

    public static async getAllBounded(request: Request): Promise<GetAllUserPostResponse> {
        let upperBound = new Date();
        if (request.query.upperBound) {
            upperBound = new Date(request.query.upperBound as string);
        }

        let lowerBound = new Date(new Date().setMonth(new Date().getMonth() - 300));
        if (request.query.lowerBound) {
            lowerBound = new Date(request.query.lowerBound as string);
        }

        const userPosts = await UserPostDao.getAllByBounds(upperBound, lowerBound);
        const convertedUserPostModels: UserPost[] = ModelConverter.convertAll(userPosts);

        return { ...SUCCESS, userPosts: convertedUserPostModels };
    }

    public static async getById(id: number): Promise<GetUserPostResponse> {
        const userPost = await UserPostDao.getById(id);

        if (userPost) {
            const convertedUserPost: UserPostModel = ModelConverter.convert(userPost);
            return { ...SUCCESS, userPost: convertedUserPost };
        }

        return RESOURCE_NOT_FOUND;
    }

    public static async update(request: Request): Promise<CreateUserPostResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const body: UpdateUserPostRequest = request.body;
        body.userPost.userId = userId;

        const currentPost = await UserPostDao.getById(body.userPost.id!);
        if (!currentPost) {
            return RESOURCE_NOT_FOUND;
        }

        if (currentPost.userId !== userId) {
            return RESOURCE_NOT_FOUND;
        }

        const userPost = await UserPostDao.update(body.userPost);
        const convertedUserPost: UserPostModel = ModelConverter.convert(userPost);
        return { ...SUCCESS, userPost: convertedUserPost };
    }
}
