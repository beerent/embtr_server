import { SUCCESS } from '@src/common/RequestResponses';
import { EmailController } from '@src/controller/EmailController';

export class MarketingService {
    public static async register(email: string) {
        await EmailController.sendEmail(
            'brent@embtr.com',
            'New Mailing List Registration',
            'New registration: ' + email
        );

        return SUCCESS;
    }
}
