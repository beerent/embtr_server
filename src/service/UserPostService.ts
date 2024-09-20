import { UserPost } from '@resources/schema';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ImageDetectionService } from './ImageService';
import { UserPostDao } from '@src/database/UserPostDao';
import { UserDao } from '@src/database/UserDao';
import { ImageDao } from '@src/database/ImageDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { BlockUserService } from './BlockUserService';
import { ApiAlertsService } from './ApiAlertsService';
import { UserService } from './UserService';

// "Thanks for the points chat" - TheibraDev - 2024-09-20

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

        ApiAlertsService.sendAlert('new post was created!');

        return createdUserPostModel;
    }

    public static async createNewUserPost(context: Context): Promise<UserPost> {
        const user = await UserService.getById(context, context.userId);
        if (!user) {
            throw new ServiceException(404, Code.USER_NOT_FOUND, 'user not found');
        }

        console.log(user);

        const randomBody =
            newUserPostOptions[Math.floor(Math.random() * newUserPostOptions.length)];
        const body = user.username + randomBody;

        const userPost: UserPost = {
            title: '',
            body: body,
            userId: context.userId,
        };

        const createdUserPost = await this.create(context, userPost);
        return createdUserPost;
    }

    public static async getAllForUser(userId: number): Promise<UserPost[]> {
        const user = await UserDao.getById(userId);
        if (!user) {
            throw new ServiceException(404, Code.USER_NOT_FOUND, 'user not found');
        }

        const userPosts = await UserPostDao.getAllForUser(userId);
        const userPostModels: UserPost[] = ModelConverter.convertAll(userPosts);

        return userPostModels;
    }

    public static async count(): Promise<number> {
        return await UserPostDao.allPostsCout();
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

        const blockedUserIds = await BlockUserService.getBlockedAndBlockedByUserIds(context);
        userPost.comments = userPost.comments.filter(
            (comment) => !blockedUserIds.includes(comment.userId)
        );

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

const newUserPostOptions = [
    ' has just joined the habit-building community! Today marks the first day of their lifelong pursuit of personal growth. Drop in and say hello!',
    " has officially embarked on their journey of self-improvement! Let's give them a warm welcome to our habit-building community!",
    ' just joined us to begin a new chapter of personal growth! Say hi and encourage them as they start this exciting journey!',
    ' has taken the first step towards building lasting habits! Come and cheer them on as they join our supportive community!',
    " is now part of our habit-building family! Let's give them a shout-out as they start working towards their goals!",
    ' has committed to becoming the best version of themselves! Say hello and share your tips to help them on this path!',
    " has just joined our community and is ready to take on new challenges! Let's welcome them as they begin their habit-building adventure!",
    ' has taken the plunge into building better habits! Give them a warm welcome as they start this exciting journey!',
    ' is ready to grow and achieve new milestones! Join in and celebrate their decision to be part of our habit-building family!',
    ' is embracing a fresh start with new habits! Let’s rally around and support them as they kick off their journey!',
    ' has chosen today as the first step in their habit-building adventure! Drop in and show some encouragement for the road ahead!',
];
