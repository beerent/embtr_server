import { EMAIL_ALREADY_IN_USE, INVALID_EMAIL, INVALID_PASSWORD, RequestResponse, SUCCESS } from 'src/common/RequestResponses';
import { firebase } from './Firebase';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

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

        const user = await this.create(email, password);

        return SUCCESS;
    }

    private static isValidEmail(email: string): boolean {
        return email.length > 0;
    }

    private static isValidPassword(password: string): boolean {
        return password.length > 0;
    }

    private static async userExists(email: string): Promise<boolean> {
        const user = await this.getUser(email);
        return user !== undefined;
    }

    private static async getUser(email: string): Promise<UserRecord | undefined> {
        try {
            return await firebase.auth().getUserByEmail(email);
        } catch {
            return undefined;
        }
    }

    private static async create(email: string, password: string): Promise<UserRecord> {
        const user: UserRecord = await firebase.auth().createUser({
            email,
            password,
        });

        return user;
    }

    public static async deleteUser(email?: string): Promise<void> {
        if (email === undefined) {
            return;
        }

        const user = await this.getUser(email);
        if (user) {
            await firebase.auth().deleteUser(user.uid);
        }
    }
}
