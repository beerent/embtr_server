import { QuoteOfTheDay } from '@resources/schema';
import { MetadataDao } from '@src/database/MetadataDao';
import { QuoteOfTheDayDao } from '@src/database/QuoteOfTheDayDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { Constants } from '@resources/types/constants/constants';

export class QuoteOfTheDayService {
    public static async count(context: Context): Promise<number> {
        return await QuoteOfTheDayDao.countByUser(context.userId);
    }

    public static async add(
        context: Context,
        quote: string,
        author?: string
    ): Promise<QuoteOfTheDay> {
        quote = quote.replace(/"/g, '');
        author = author?.replace(/"/g, '');

        const quoteOfTheDay = await QuoteOfTheDayDao.add(context.userId, quote, author);
        const quoteOfTheDayModel: QuoteOfTheDay = ModelConverter.convert(quoteOfTheDay);

        return quoteOfTheDayModel;
    }

    public static async get(context: Context): Promise<QuoteOfTheDay> {
        const quoteOfTheDayFromMetadata = await MetadataDao.get(
            Constants.MetadataKey.QUOTE_OF_THE_DAY
        );
        if (!quoteOfTheDayFromMetadata?.value) {
            throw new ServiceException(
                404,
                Code.QUOTE_OF_THE_DAY_NOT_FOUND,
                'quote of the day not found'
            );
        }

        const quoteOfTheDayId = parseInt(quoteOfTheDayFromMetadata.value);
        if (isNaN(quoteOfTheDayId)) {
            throw new ServiceException(
                500,
                Code.GENERIC_ERROR,
                'quote of the day id is not a number'
            );
        }

        let quoteOfTheDay;
        if (this.shouldReset(quoteOfTheDayFromMetadata.updatedAt)) {
            quoteOfTheDay = await this.reset();
        } else {
            quoteOfTheDay = await QuoteOfTheDayDao.getById(quoteOfTheDayId);
        }

        if (!quoteOfTheDay) {
            throw new ServiceException(
                404,
                Code.QUOTE_OF_THE_DAY_NOT_FOUND,
                'quote of the day not found'
            );
        }

        const quoteOfTheDayModel: QuoteOfTheDay = ModelConverter.convert(quoteOfTheDay);
        return quoteOfTheDayModel;
    }

    private static shouldReset(updated: Date): boolean {
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - updated.getTime()) / 1000 / 60 / 60;

        return hoursSinceUpdate > 24;
    }

    private static async reset() {
        const quoteOfTheDay = await QuoteOfTheDayDao.getRandom();
        await MetadataDao.set('QUOTE_OF_THE_DAY', quoteOfTheDay.id.toString());

        return quoteOfTheDay;
    }

    public static async getAll() {
        const quotesOfTheDay = await QuoteOfTheDayDao.getAll();
        const quoteOfTheDayModels: QuoteOfTheDay[] = ModelConverter.convertAll(quotesOfTheDay);

        return quoteOfTheDayModels;
    }
}
