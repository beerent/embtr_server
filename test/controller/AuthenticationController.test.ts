import { AccountController } from '@src/controller/AccountController';
import { AuthenticationController } from '@src/controller/AuthenticationController';

describe('authenticate user', () => {
    describe('fail cases', () => {
        test('bearer token is missing', async () => {
            const isAuthenticated = await AuthenticationController.tokenIsValid('');
            expect(isAuthenticated).toBe(false);
        });

        test('bearer token is invalid', async () => {
            const isAuthenticated = await AuthenticationController.tokenIsValid('invalid token');
            expect(isAuthenticated).toBe(false);
        });

        //TODO - test that we are handling expired tokens
    });

    describe('success cases', () => {
        beforeAll(async () => {
            await AccountController.create('auth_test@embtr.com', 'password');
        });

        afterAll(async () => {
            await AccountController.delete('auth_test@embtr.com');
        });

        test('token is valid', async () => {
            const idToken = await AuthenticationController.getValidIdToken('auth_test@embtr.com', 'password');
            const isAuthenticated = await AuthenticationController.tokenIsValid(`Bearer ${idToken}`);

            expect(isAuthenticated).toBe(true);
        });

        //TODO - test that we are pulling from the cache
    });
});
