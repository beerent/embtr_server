import { firebase } from '@src/auth/Firebase';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export class TokenCache {
    private static tokenCache: Map<string, DecodedIdToken> = new Map();

    public static async getDecodedToken(
        authorizationHeader: string
    ): Promise<DecodedIdToken | undefined> {
        const encodedToken = this.getBearerToken(authorizationHeader);
        if (!encodedToken) {
            return undefined;
        }

        const decodedToken = await this.decodeAndAddTokenToCache(encodedToken);
        return decodedToken;
    }

    public static async invalidateToken(authorizationHeader: string): Promise<void> {
        const encodedToken = this.getBearerToken(authorizationHeader);
        if (!encodedToken) {
            return;
        }

        this.tokenCache.delete(encodedToken);
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

    private static async decodeAndAddTokenToCache(
        token: string
    ): Promise<DecodedIdToken | undefined> {
        const decodedToken: DecodedIdToken | undefined =
            await this.getDecodedTokenFromFirebase(token);
        if (!decodedToken) {
            return undefined;
        }

        if (this.isTokenExpired(decodedToken)) {
            return undefined;
        }

        this.addDecodedTokenToCache(token, decodedToken);

        return decodedToken;
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

    private static getDecodedTokenFromCache(encodedToken: string) {
        const decodedToken = this.tokenCache.get(encodedToken);
        if (!decodedToken) {
            return undefined;
        }

        if (this.isTokenExpired(decodedToken)) {
            this.removeTokenFromCache(encodedToken);
            return undefined;
        }

        return decodedToken;
    }

    private static addDecodedTokenToCache(token: string, decodedToken: DecodedIdToken) {
        this.tokenCache.set(token, decodedToken);
    }

    private static removeTokenFromCache(token: string) {
        this.tokenCache.delete(token);
    }
}
