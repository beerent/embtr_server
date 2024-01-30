import { Role } from '@src/roles/Roles';
import { TokenService } from '@src/general/auth/TokenService';
require('dotenv').config();

export class AuthorizationDao {
    public static async getUserIdFromToken(
        authorizationHeader: string
    ): Promise<number | undefined> {
        const decodedToken = await TokenService.getDecodedToken(authorizationHeader);

        if (!decodedToken?.userId) {
            return undefined;
        }

        return decodedToken.userId;
    }

    public static async getRolesFromToken(authorizationHeader: string): Promise<Role[]> {
        const decodedToken = await TokenService.getDecodedToken(authorizationHeader);

        if (!decodedToken?.roles) {
            return [];
        }

        return decodedToken.roles;
    }

    public static async getUidFromToken(authorizationHeader: string): Promise<string | undefined> {
        const decodedToken = await TokenService.getDecodedToken(authorizationHeader);

        if (!decodedToken?.uid) {
            return undefined;
        }

        return decodedToken.uid;
    }

    public static async getEmailFromToken(
        authorizationHeader: string
    ): Promise<string | undefined> {
        const decodedToken = await TokenService.getDecodedToken(authorizationHeader);

        if (!decodedToken?.email) {
            return undefined;
        }

        return decodedToken.email;
    }
}
