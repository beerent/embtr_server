import { FeaturedPost } from '@resources/schema';
import { FeaturedPostDao } from '@src/database/FeaturedPostDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class FeaturedPostService {
    public static async get(context: Context, id: number): Promise<FeaturedPost | undefined> {
        const featuredPost = await FeaturedPostDao.get(id);
        if (!featuredPost) {
            return undefined;
        }

        const featuredPostModel: FeaturedPost = ModelConverter.convert(featuredPost);
        return featuredPostModel;
    }

    public static async getLatest(context: Context): Promise<FeaturedPost | undefined> {
        const latestFeaturedPost = await FeaturedPostDao.getLatest();
        if (!latestFeaturedPost) {
            return undefined;
        }

        const latestFeaturedPostModel: FeaturedPost = ModelConverter.convert(latestFeaturedPost);
        return latestFeaturedPostModel;
    }

    public static async getLatestUnexpired(context: Context): Promise<FeaturedPost | undefined> {
        const latestFeaturedPost = await FeaturedPostDao.getLatestUnexpired(context.dateTime);
        if (!latestFeaturedPost) {
            return undefined;
        }

        const latestFeaturedPostModel: FeaturedPost = ModelConverter.convert(latestFeaturedPost);
        return latestFeaturedPostModel;
    }
}
