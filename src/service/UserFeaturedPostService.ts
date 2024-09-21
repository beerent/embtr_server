import { UserFeaturedPost } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { logger } from '@src/common/logger/Logger';
import { UserFeaturedPostDao } from '@src/database/UserFeaturedPostDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { FeaturedPostService } from './FeaturedPostService';

export class UserFeaturedPostService {
    public static async get(context: Context, id: number): Promise<UserFeaturedPost | undefined> {
        const userFeaturedPost = await UserFeaturedPostDao.get(id);
        if (!userFeaturedPost) {
            return undefined;
        }

        const userFeaturedPostModel: UserFeaturedPost = ModelConverter.convert(userFeaturedPost);
        return userFeaturedPostModel;
    }

    public static async getAllByIds(context: Context, ids: number[]): Promise<UserFeaturedPost[]> {
        const userFeaturedPosts = await UserFeaturedPostDao.getAllByIds(context.userId, ids);
        const userFeaturedPostModels: UserFeaturedPost[] =
            ModelConverter.convertAll(userFeaturedPosts);

        return userFeaturedPostModels;
    }

    public static async getAllForUser(context: Context) {
        const userFeaturedPosts = await UserFeaturedPostDao.getAllForUser(context.userId);
        const userFeaturedPostModels = ModelConverter.convertAll(userFeaturedPosts);

        return userFeaturedPostModels;
    }

    public static async copyAllLatest(context: Context) {
        await Promise.all([
            this.copyLatestOfType(context, Constants.FeaturedPostType.POST),
            this.copyLatestOfType(context, Constants.FeaturedPostType.QUOTE_OF_THE_DAY),
        ]);
    }

    public static async markAsViewed(context: Context, id: number) {
        const userFeaturedPost = await this.get(context, id);
        if (!userFeaturedPost) {
            return;
        }

        userFeaturedPost.isViewed = true;
        userFeaturedPost.sortDate = new Date();

        await UserFeaturedPostDao.update(userFeaturedPost);
    }

    private static async copyLatestOfType(context: Context, type: Constants.FeaturedPostType) {
        const latestFeaturedPost = await FeaturedPostService.getLatestUnexpired(context, type);

        if (!latestFeaturedPost?.id) {
            logger.info(`no latest featured post of type ${type}`);
            return;
        }

        const userFeaturedPost = await this.getByFeaturedPostId(context, latestFeaturedPost.id);
        if (userFeaturedPost) {
            logger.info(`already copied latest featured post of type ${type}`);
            return;
        }

        const sortDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        await UserFeaturedPostDao.createIfNotExists(
            context.userId,
            latestFeaturedPost.id,
            sortDate
        );

        logger.info(`copied latest featured post id ${latestFeaturedPost.id} of type ${type}`);
    }

    private static async getByFeaturedPostId(context: Context, featuredPostId: number) {
        const userFeaturedPost = await UserFeaturedPostDao.getByUserIdAndFeaturedPostId(
            context.userId,
            featuredPostId
        );

        if (!userFeaturedPost) {
            return undefined;
        }

        const userFeaturedPostModel = ModelConverter.convert(userFeaturedPost);
        return userFeaturedPostModel;
    }
}
