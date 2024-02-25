import { AccountDao } from '@src/database/AccountDao';
import { Context } from '@src/general/auth/Context';
import { Role } from '@src/roles/Roles';

export class UserRoleService {
    // needs to update database
    public static async addUserRole(context: Context, email: string, role: Role) {
        const account = await AccountDao.getByEmail(email);
        AccountDao.addAccountRole(account!.uid, role);
    }

    // needs to update database
    public static async removeUserRole(context: Context, email: string, role: Role) {
        const account = await AccountDao.getByEmail(email);
        AccountDao.removeAccountRole(account!.uid, role);
    }

    public static async isAdmin(email: string): Promise<boolean> {
        const account = await AccountDao.getByEmail(email);
        const isAdmin = account?.customClaims?.roles?.includes(Role.ADMIN);

        return isAdmin;
    }

    public static async isUser(email: string): Promise<boolean> {
        const account = await AccountDao.getByEmail(email);
        const isAdmin = account?.customClaims?.roles?.includes(Role.USER);

        return isAdmin;
    }

    public static async getRoles(email: string): Promise<Role[]> {
        const account = await AccountDao.getByEmail(email);
        const roles = account?.customClaims?.roles;

        return roles;
    }
}
