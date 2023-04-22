import { firestore } from '@src/auth/Firebase';
import { logger } from '@src/common/logger/Logger';

export class EmailController {
    public static async sendEmail(
        recipient: string,
        subject: string,
        body: string
    ): Promise<string> {
        const mail = firestore.collection('mail');
        logger.log('info', 'subject: ' + subject);
        logger.log('info', 'body: ' + body);
        logger.log('info', 'Sending email to ' + recipient);
        const record = {
            to: [recipient],
            message: {
                subject: subject,
                text: body,
            },
        };

        const result = await mail.add(record);
        return result.id;
    }
}
