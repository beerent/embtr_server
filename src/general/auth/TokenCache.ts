import { firebase } from '@src/auth/Firebase';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export class TokenCache {
    private static tokenCache: Map<string, DecodedIdToken> = new Map();

    public static async getDecodedToken(authorizationHeader: string): Promise<DecodedIdToken | undefined> {
        const encodedToken = this.getBearerToken(authorizationHeader);
        if (!encodedToken) {
            return undefined;
        }

        await this.decodeAndAddTokenToCache(encodedToken);

        const decodedToken = this.getDecodedTokenFromCache(encodedToken);
        if (!decodedToken) {
            return undefined;
        }

        if (this.isTokenExpired(decodedToken)) {
            this.removeTokenFromCache(encodedToken);
            return undefined;
        }

        return decodedToken;
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

    private static async decodeAndAddTokenToCache(token: string) {
        const decodedToken: DecodedIdToken | undefined = await this.getDecodedTokenFromFirebase(token);
        if (!decodedToken) {
            return;
        }

        if (this.isTokenExpired(decodedToken)) {
            return;
        }

        this.addDecodedTokenToCache(token, decodedToken);
    }

    private static async getDecodedTokenFromFirebase(token: string) {
        try {
            return await firebase.auth().verifyIdToken(token);
        } catch (error) {
            return undefined;
        }
    }

    private static isTokenExpired(decodedToken: DecodedIdToken): boolean {
        const expirationTime = decodedToken.exp;
        const expirationDate = new Date(expirationTime * 1000);
        const currentTime = new Date();

        return expirationDate < currentTime;
    }

    private static getDecodedTokenFromCache(token: string) {
        return this.tokenCache.get(token);
    }

    private static addDecodedTokenToCache(token: string, decodedToken: DecodedIdToken) {
        this.tokenCache.set(token, decodedToken);
    }

    private static removeTokenFromCache(token: string) {
        this.tokenCache.delete(token);
    }
}
