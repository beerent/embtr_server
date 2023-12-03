import { TokenCache } from '@src/general/auth/TokenCache';
import { EnvironmentOption } from '@src/utility/environment/EnvironmentUtility';

const apiKey = EnvironmentOption.get(EnvironmentOption.FIREBASE_WEB_API_KEY);
const GENERATE_TOKEN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

export class AuthenticationController {
    public static async tokenIsValid(authorizationHeader: string) {
        const decodedToken = await TokenCache.getDecodedToken(authorizationHeader);
        return decodedToken !== undefined;
    }

    public static async generateValidIdToken(email: string, password: string): Promise<string> {
        const response = await fetch(GENERATE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const { idToken } = await response.json();

        return idToken;
    }
}
