import { AccountDao } from '@src/database/AccountDao';
import { RoleDao } from '@src/database/RoleDao';
import { UserDao } from '@src/database/UserDao';
import { Context, NewUserContext } from '@src/general/auth/Context';
import { Role } from '@src/roles/Roles';

export class UserRoleService {
    public static async addUserRole(context: Context | NewUserContext, email: string, role: Role) {
        this.addUserRoles(context, email, [role]);
    }

    public static async addUserRoles(
        context: Context | NewUserContext,
        email: string,
        roles: Role[]
    ) {
        const databaseRoles = await RoleDao.getAllByName(roles);
        if (!databaseRoles) {
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

        const databaseRoleIds = databaseRoles.map((role) => {
            return role.id;
        });

        try {
            const updatedUser = await UserDao.addUserRoles(user.uid, databaseRoleIds);
            if (!updatedUser) {
                return;
            }
        } catch (error) {
            return;
        }

        try {
            await AccountDao.addAccountRoles(account!.uid, roles);
        } catch (error) {
            await UserDao.removeUserRoles(user.uid, databaseRoleIds);
        }
    }

    public static async removeUserRole(context: Context, email: string, role: Role) {
        this.removeUserRoles(context, email, [role]);
    }

    public static async removeUserRoles(context: Context, email: string, roles: Role[]) {
        const databaseRoles = await RoleDao.getAllByName(roles);
        if (!databaseRoles) {
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

        const databaseRoleIds = databaseRoles.map((role) => {
            return role.id;
        });

        try {
            const updatedUser = await UserDao.removeUserRoles(user.uid, databaseRoleIds);
            if (!updatedUser) {
                return;
            }
        } catch (error) {
            return;
        }

        try {
            await AccountDao.removeAccountRoles(account!.uid, roles);
        } catch (error) {
            await UserDao.addUserRoles(user.uid, databaseRoleIds);
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
