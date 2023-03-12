import { AccountController } from '@src/controller/AccountController';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { Role } from '@src/roles/Roles';

const ACCOUNT_WITH_NO_ROLES = 'author_ct_email_no_roles@embtr.com';
let ACCOUNT_WITH_NO_ROLES_UID: string;

const ACCOUNT_WITH_USER_ROLES = 'author_ct_email_user_roles@embtr.com';
let ACCOUNT_WITH_USER_ROLES_UID: string;

describe('authorization', () => {
    beforeAll(async () => {
        const deletes = [AccountController.delete(ACCOUNT_WITH_NO_ROLES), AccountController.delete(ACCOUNT_WITH_USER_ROLES)];
        await Promise.all(deletes);

        const creates = [AccountController.create(ACCOUNT_WITH_NO_ROLES, 'password'), AccountController.create(ACCOUNT_WITH_USER_ROLES, 'password')];
        const [account1, account2] = await Promise.all(creates);
        ACCOUNT_WITH_NO_ROLES_UID = account1.user!.uid;
        ACCOUNT_WITH_USER_ROLES_UID = account2.user!.uid;

        const addRoles = [AccountController.updateAccountRoles(ACCOUNT_WITH_USER_ROLES_UID, [Role.USER])];
        await Promise.all(addRoles);
    });

    afterAll(async () => {
        const deletes = [AccountController.delete(ACCOUNT_WITH_NO_ROLES), AccountController.delete(ACCOUNT_WITH_USER_ROLES)];
        await Promise.all(deletes);
    });

    describe('role extraction', () => {
        test('bearer token is missing', async () => {
            const roles: Role[] = await AuthorizationController.getRolesFromToken('');
            expect(roles).toEqual([]);
        });

        test('bearer token is invalid', async () => {
            const roles: Role[] = await AuthorizationController.getRolesFromToken('invalid token');
            expect(roles).toEqual([]);
        });

        test('can get user roles with valid account no roles', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const roles: Role[] = await AuthorizationController.getRolesFromToken(`Bearer ${token}`);
            expect(roles).toEqual([]);
        });

        test('can get user roles with valid account with roles', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLES, 'password');
            const roles: Role[] = await AuthorizationController.getRolesFromToken(`Bearer ${token}`);
            expect(roles).toEqual([Role.USER]);
        });
    });

    describe('uid extraction', () => {
        test('bearer token is missing', async () => {
            const uid = await AuthorizationController.getUidFromToken('');
            expect(uid).toBeUndefined();
        });

        test('bearer token is invalid', async () => {
            const uid = await AuthorizationController.getUidFromToken('invalid token');
            expect(uid).toBeUndefined();
        });

        test('can get uid', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const uid = await AuthorizationController.getUidFromToken(`Bearer ${token}`);
            expect(uid).toBeDefined();
        });
    });

    describe('email extraction', () => {
        test('bearer token is missing', async () => {
            const uid = await AuthorizationController.getEmailFromToken('');
            expect(uid).toBeUndefined();
        });

        test('bearer token is invalid', async () => {
            const uid = await AuthorizationController.getEmailFromToken('invalid token');
            expect(uid).toBeUndefined();
        });
    });

    describe('success cases', () => {
        test('can get uid', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const email = await AuthorizationController.getEmailFromToken(`Bearer ${token}`);

            expect(email).toBe(ACCOUNT_WITH_NO_ROLES);
        });
    });

    describe('user id extraction', () => {
        test('bearer token is missing', async () => {
            const id = await AuthorizationController.getUserIdFromToken('');
            expect(id).toBeUndefined();
        });

        test('bearer token is invalid', async () => {
            const id = await AuthorizationController.getUserIdFromToken('invalid token');
            expect(id).toBeUndefined();
        });

        test('can get userId', async () => {
            await AccountController.updateCustomClaim(ACCOUNT_WITH_NO_ROLES_UID, 'userId', '123');
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const userId = await AuthorizationController.getUserIdFromToken(`Bearer ${token}`);

            expect(userId).toBe('123');
        });
    });
});
