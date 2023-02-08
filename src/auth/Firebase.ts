// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import admin from 'firebase-admin';

const serviceAccount = require('../../.service.json');

export const firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
