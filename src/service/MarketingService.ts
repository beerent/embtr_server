import { SUCCESS } from '@src/common/RequestResponses';
import { EmailDao } from '@src/database/EmailDao';

export class MarketingService {
    public static async register(email: string) {
        await EmailDao.sendEmail(
            'marketing@embtr.com',
            'New Mailing List Registration',
            'New registration: ' + email
        );

        return SUCCESS;
    }
}
