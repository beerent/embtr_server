import { firestore } from '@src/auth/Firebase';

export class EmailController {
    public static async sendEmail(recipient: string, subject: string, body: string): Promise<string> {
        const mail = firestore.collection('mail');
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
