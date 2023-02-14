import { firestore } from '@src/auth/Firebase';
import { EmailController } from '@src/notifications/email/EmailController';

describe.skip('send email success test case', () => {
    test('email is sent', async () => {
        const email = 'brent@embtr.com';
        const subject = 'test subject';
        const body = 'test body';

        const documentId = await EmailController.sendEmail(email, subject, body);

        const docRef = firestore.collection('mail').doc(documentId);

        const doc = await docRef.get();
        const data = doc.data();
        if (data) {
            const state = data['delivery']['state'];
            expect(doc.exists).toBe(true);
        }
    });
});
