import { Role } from '@src/roles/Roles';
import { TokenCache } from '@src/general/auth/TokenCache';
require('dotenv').config();

export class AuthorizationController {
    public static async getRolesFromToken(authorizationHeader: string): Promise<Role[]> {
        const decodedToken = await TokenCache.getDecodedToken(authorizationHeader);
        if (!decodedToken) {
            return [];
        }

        if (!decodedToken.claims.roles) {
            return [];
        }

        return decodedToken.claims.roles;
    }
}
