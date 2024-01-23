import { HttpCode } from '@src/common/RequestResponses';
import { Code } from '@resources/codes';
import { AccountDao } from '@src/database/AccountDao';
import { UserDao } from '@src/database/UserDao';
import { Context } from '@src/general/auth/Context';
import { Roles } from '@src/roles/Roles';
import { Role } from '@src/roles/Roles';
import { ServiceException } from '@src/general/exception/ServiceException';

export class UserRoleService {
    public static async hardDelete(context: Context, email: string) {
        const isAdmin = Roles.isAdmin(context.userRoles);
        if (!isAdmin) {
            throw new ServiceException(HttpCode.FORBIDDEN, Code.FORBIDDEN, 'forbidden');
        }

        const account = await AccountDao.getByEmail(email);
        if (!account) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.RESOURCE_NOT_FOUND,
                'user not found'
            );
        }

        const uid = account.uid;
        await AccountDao.delete(email);

        const user = await UserDao.getByUid(uid);
        if (user) {
            await UserDao.deleteByUid(uid);
        }
    }

    public static async setUserRole(context: Context, email: string, role: Role) {
        //if (!Roles.isAdmin(context.userRoles)) {
        //    throw new ServiceException(HttpCode.FORBIDDEN, Code.FORBIDDEN, 'forbidden');
        //}

        const account = await AccountDao.getByEmail(email);
        AccountDao.updateAccountRoles(account!.uid, [role]);
    }

    public static async removeUserRole(context: Context, email: string, role: Role) {
        const account = await AccountDao.getByEmail(email);
        AccountDao.removeAccountRoles(account!.uid, [role]);
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
