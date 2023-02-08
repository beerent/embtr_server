import { firebase } from './Firebase';

export class UserAuthentication {
    public static async authenticate(authorization: string) {
        const bearerToken = this.getBearerToken(authorization);
        if (!bearerToken) {
            return false;
        }

        const result = await firebase.auth().verifyIdToken(bearerToken);
        console.log(result);

        return true;
    }

    private static getBearerToken(authorization: string) {
        if (!this.isBearer(authorization)) {
            return null;
        }

        return authorization.split('Bearer ')[1];
    }

    private static isBearer(authorization: string) {
        if (!authorization || !authorization.includes('Bearer')) {
            return false;
        }

        return authorization.startsWith('Bearer ');
    }
}
