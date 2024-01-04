import { QuoteOfTheDay } from '@resources/schema';
import {
    CreateQuoteOfTheDayRequest,
    CreateQuoteOfTheDayResponse,
    GetQuoteOfTheDayResponse,
} from '@resources/types/requests/QuoteOfTheDayTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { MetadataDao } from '@src/database/MetadataDao';
import { QuoteOfTheDayDao } from '@src/database/QuoteOfTheDayDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

export class QuoteOfTheDayService {
    public static async add(request: Request): Promise<CreateQuoteOfTheDayResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        //remove all double quotes
        const body: CreateQuoteOfTheDayRequest = request.body.replace(/"/g, '');

        const quoteOfTheDay = await QuoteOfTheDayDao.add(userId, body.quote, body.author);
        const quoteOfTheDayModel: QuoteOfTheDay = ModelConverter.convert(quoteOfTheDay);

        return { ...SUCCESS, quoteOfTheDay: quoteOfTheDayModel };
    }

    public static async get(): Promise<GetQuoteOfTheDayResponse> {
        const quoteOfTheDayFromMetadata = await MetadataDao.get('QUOTE_OF_THE_DAY');
        if (!quoteOfTheDayFromMetadata?.value) {
            return { ...GENERAL_FAILURE };
        }

        const quoteOfTheDayId = parseInt(quoteOfTheDayFromMetadata.value);
        if (isNaN(quoteOfTheDayId)) {
            return { ...GENERAL_FAILURE };
        }

        let quoteOfTheDay;
        if (this.shouldReset(quoteOfTheDayFromMetadata.updatedAt)) {
            quoteOfTheDay = await this.reset();
        } else {
            quoteOfTheDay = await QuoteOfTheDayDao.getById(quoteOfTheDayId);
        }

        if (!quoteOfTheDay) {
            return { ...GENERAL_FAILURE };
        }

        const quoteOfTheDayModel: QuoteOfTheDay = ModelConverter.convert(quoteOfTheDay);

        return { ...SUCCESS, quoteOfTheDay: quoteOfTheDayModel };
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
}
