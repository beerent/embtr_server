import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { firebase } from '../auth/Firebase';
require('dotenv').config();

export class AuthenticationController {
    private static tokenCache: Map<string, DecodedIdToken> = new Map();

    public static async tokenIsValid(authorizationHeader: string) {
        const encodedToken = this.getBearerToken(authorizationHeader);
        if (!encodedToken) {
            return false;
        }

        await this.decodeAndAddTokenToCache(encodedToken);

        const decodedToken = this.getDecodedTokenFromCache(encodedToken);
        if (!decodedToken) {
            return false;
        }

        if (this.isTokenExpired(decodedToken)) {
            this.removeTokenFromCache(encodedToken);
            return false;
        }

        return true;
    }

    public static async getValidIdToken(email: string, password: string) {
        const apiKey = process.env.FIREBASE_WEB_API_KEY;

        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const { idToken } = await response.json();

        return idToken;
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
