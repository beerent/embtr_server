import { FeaturedPost } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { FeaturedPostDao } from '@src/database/FeaturedPostDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { QuoteOfTheDayService } from './QuoteOfTheDayService';

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

    public static async createQuoteOfTheDay(context: Context): Promise<FeaturedPost> {
        const quoteOfTheDay = await QuoteOfTheDayService.getRandom();

        let quote = quoteOfTheDay.quote;
        if (quoteOfTheDay.author) {
            quote += `\n\n- ${quoteOfTheDay.author}`;
        }

        const featuredPost: FeaturedPost = {
            title: 'Quote of the Day',
            subtitle: 'quote #523',
            body: quote,
            type: Constants.FeaturedPostType.QUOTE_OF_THE_DAY,
        };

        const createdFeaturedPost = await this.create(context, featuredPost);
        return createdFeaturedPost;
    }

    private static async create(
        context: Context,
        featuredPost: FeaturedPost
    ): Promise<FeaturedPost> {
        const createdFeaturedPost = await FeaturedPostDao.create(featuredPost);
        const createdFeaturedPostModel: FeaturedPost = ModelConverter.convert(createdFeaturedPost);

        return createdFeaturedPostModel;
    }

    public static async getLatestUnexpired(
        context: Context,
        type: Constants.FeaturedPostType
    ): Promise<FeaturedPost | undefined> {
        const latestFeaturedPost = await FeaturedPostDao.getLatestUnexpired(context.dateTime, type);
        if (!latestFeaturedPost) {
            return undefined;
        }

        const latestFeaturedPostModel: FeaturedPost = ModelConverter.convert(latestFeaturedPost);
        return latestFeaturedPostModel;
    }
}
