import { AccountDao } from '@src/database/AccountDao';
import { RoleDao } from '@src/database/RoleDao';
import { UserDao } from '@src/database/UserDao';
import { Context } from '@src/general/auth/Context';
import { Role } from '@src/roles/Roles';

export class UserRoleService {
    public static async addUserRole(context: Context, email: string, role: Role) {
        const databaseRole = await RoleDao.get(role);
        if (!databaseRole) {
            return;
        }

        const user = await UserDao.getByEmail(email);
        if (!user) {
            return;
        }

        const account = await AccountDao.getByEmail(email);
        if (!account) {
            return;
        }

        try {
            const updatedUser = await UserDao.addUserRole(user.uid, databaseRole.id);
            if (!updatedUser) {
                return;
            }
        } catch (error) {
            return;
        }

        try {
            await AccountDao.addAccountRole(account!.uid, role);
        } catch (error) {
            await UserDao.removeUserRole(user.uid, databaseRole.id);
        }
    }

    // needs to update database
    public static async removeUserRole(context: Context, email: string, role: Role) {
        const databaseRole = await RoleDao.get(role);
        if (!databaseRole) {
            return;
        }

        const user = await UserDao.getByEmail(email);
        if (!user) {
            return;
        }

        const account = await AccountDao.getByEmail(email);
        if (!account) {
            return;
        }

        try {
            const updatedUser = await UserDao.removeUserRole(user.uid, databaseRole.id);
            if (!updatedUser) {
                return;
            }
        } catch (error) {
            return;
        }

        try {
            await AccountDao.removeAccountRole(account!.uid, role);
        } catch (error) {
            await UserDao.addUserRole(user.uid, databaseRole.id);
        }
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

    public static async getRoles(email: string) {
        const user = await UserDao.getByEmail(email);
        const account = await AccountDao.getByEmail(email);
        const accountRoles = account?.customClaims?.roles;
        const userRoles = user?.roles;

        return {
            accountRoles,
            userRoles,
        };
    }
}
