import { firestore } from '@src/auth/Firebase';
import { EmailDao } from '@src/database/EmailDao';

describe.skip('send email success test case', () => {
    test('email is sent', async () => {
        const email = 'brent@embtr.com';
        const subject = 'test subject';
        const body = 'test body';

        const documentId = await EmailDao.sendEmail(email, subject, body);

        const docRef = firestore.collection('mail').doc(documentId);

        const doc = await docRef.get();
        const data = doc.data();
        if (data) {
            const state = data['delivery']['state'];
            expect(doc.exists).toBe(true);
        }
    });
});
