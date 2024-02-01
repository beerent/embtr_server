import { UserPost } from '@resources/schema';
import { GetAllUserPostResponse } from '@resources/types/requests/UserPostTypes';
import { RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ImageDetectionService } from './ImageService';
import { UserPostDao } from '@src/database/UserPostDao';
import { UserDao } from '@src/database/UserDao';
import { ImageDao } from '@src/database/ImageDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';

export class UserPostService {
    public static async create(context: Context, userPost: UserPost): Promise<UserPost> {
        userPost.userId = context.userId;

        const filteredImageResults = await ImageDetectionService.filterImages(
            userPost.images ?? []
        );
        userPost.images = filteredImageResults.clean;
        await ImageDao.deleteImages(filteredImageResults.adult);

        const createdUserPost = await UserPostDao.create(userPost);
        const createdUserPostModel: UserPost = ModelConverter.convert(createdUserPost);

        return createdUserPostModel;
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

    public static async getAllByIds(context: Context, ids: number[]): Promise<UserPost[]> {
        if (ids.length === 0) {
            return [];
        }

        const userPosts = await UserPostDao.getAllInIds(ids);
        const userPostModels: UserPost[] = ModelConverter.convertAll(userPosts);
        return userPostModels;
    }

    public static async getAllBounded(
        context: Context,
        lowerBound: Date,
        upperBound: Date
    ): Promise<UserPost[]> {
        const userPosts = await UserPostDao.getAllByBounds(lowerBound, upperBound);
        const userPostModels: UserPost[] = ModelConverter.convertAll(userPosts);

        return userPostModels;
    }

    public static async getById(context: Context, id: number): Promise<UserPost> {
        const userPost = await UserPostDao.getById(id);

        if (!userPost) {
            throw new ServiceException(404, Code.USER_POST_NOT_FOUND, 'user post not found');
        }

        const userPostModel: UserPost = ModelConverter.convert(userPost);
        return userPostModel;
    }

    public static async update(context: Context, userPost: UserPost): Promise<UserPost> {
        if (!userPost.id) {
            throw new ServiceException(400, Code.INVALID_REQUEST, 'invalid request');
        }

        const databaseUserPost = await UserPostDao.getById(userPost.id!);
        if (!databaseUserPost) {
            throw new ServiceException(404, Code.USER_POST_NOT_FOUND, 'user post not found');
        }

        if (databaseUserPost.userId !== context.userId) {
            throw new ServiceException(403, Code.FORBIDDEN, 'user does not have permission');
        }

        userPost.userId = context.userId;
        const updatedUserPost = await UserPostDao.update(userPost);
        const updatedUserPostModel: UserPost = ModelConverter.convert(updatedUserPost);
        return updatedUserPostModel;
    }
}
