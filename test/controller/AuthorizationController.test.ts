import { AccountController } from '@src/controller/AccountController';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { Role } from '@src/roles/Roles';

describe('authorization', () => {
    describe('role extraction', () => {
        describe('fail cases', () => {
            test('bearer token is missing', async () => {
                const roles: Role[] = await AuthorizationController.getRolesFromToken('');
                expect(roles).toEqual([]);
            });

            test('bearer token is invalid', async () => {
                const roles: Role[] = await AuthorizationController.getRolesFromToken('invalid token');
                expect(roles).toEqual([]);
            });
        });

        describe('success cases', () => {
            const email = 'get_user_roles@embtr.com';

            beforeAll(async () => {
                await AccountController.delete(email);
                await AccountController.create(email, 'password');
            });

            test('can get user roles', async () => {
                const roles: Role[] = await AuthorizationController.getRolesFromToken('');
                expect(roles).toEqual([]);
            });
        });
    });
});
