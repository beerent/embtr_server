import { EMAIL_ALREADY_IN_USE, INVALID_EMAIL, INVALID_PASSWORD, RequestResponse, SUCCESS } from 'src/common/RequestResponses';
import { firebase } from './Firebase';

export class UserController {
    public static async createUser(email?: string, password?: string): Promise<RequestResponse> {
        const validEmail = email !== undefined && this.isValidEmail(email);
        if (!validEmail) {
            return INVALID_EMAIL;
        }

        const validPassword = password !== undefined && this.isValidPassword(password);
        if (!validPassword) {
            return INVALID_PASSWORD;
        }

        const userExists = await this.userExists(email);
        if (userExists) {
            return EMAIL_ALREADY_IN_USE;
        }

        return SUCCESS;
    }

    private static isValidEmail(email: string): boolean {
        return email.length > 0;
    }

    private static isValidPassword(password: string): boolean {
        return password.length > 0;
    }

    private static async userExists(email: string): Promise<boolean> {
        try {
            await firebase.auth().getUserByEmail(email);
            return true;
        } catch {
            return false;
        }
    }
}
