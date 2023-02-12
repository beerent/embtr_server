import admin from 'firebase-admin';
import serviceAccount from '@resources/firebase.json';

const credential = JSON.parse(JSON.stringify(serviceAccount));

export const firebase = admin.initializeApp({
    credential: admin.credential.cert(credential),
});

export const firestore = admin.firestore();
