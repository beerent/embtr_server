import { firebase } from '@src/auth/Firebase';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export class TokenService {
    public static async getDecodedToken(
        authorizationHeader: string
    ): Promise<DecodedIdToken | undefined> {
        const encodedToken = this.getBearerToken(authorizationHeader);
        if (!encodedToken) {
            return undefined;
        }

        const decodedToken: DecodedIdToken | undefined =
            await this.getDecodedTokenFromFirebase(encodedToken);
        if (!decodedToken) {
            return undefined;
        }

        return decodedToken;
    }

    public static invalidateToken(uid: string) {
        return firebase.auth().revokeRefreshTokens(uid);
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

    private static async getDecodedTokenFromFirebase(token: string) {
        try {
            return await firebase.auth().verifyIdToken(token);
        } catch (error) {
            return undefined;
        }
    }
}
