import { EnvironmentOption } from '@src/utility/environment/EnvironmentUtility';
import admin from 'firebase-admin';
const keyFilename = EnvironmentOption.get(EnvironmentOption.SERVICE_CREDENTIALS_FILE_PATH);

const credential = JSON.parse(JSON.stringify(keyFilename));

export const firebase = admin.initializeApp({
    credential: admin.credential.cert(credential),
});

export const firestore = admin.firestore();
export const storage = admin.storage();
