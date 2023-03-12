import { AccountController } from '@src/controller/AccountController';
import { AuthenticationController } from '@src/controller/AuthenticationController';

describe('authentication', () => {
    const ACCOUNT_THAT_EXISTS = 'authen_ct_email_that_exists@embtr.com';

    beforeAll(async () => {
        const deletes = [AccountController.delete(ACCOUNT_THAT_EXISTS)];
        await Promise.all(deletes);

        const creates = [AccountController.create(ACCOUNT_THAT_EXISTS, 'password')];
        await Promise.all(creates);
    });

    afterAll(async () => {
        const deletes = [AccountController.delete(ACCOUNT_THAT_EXISTS)];
        await Promise.all(deletes);
    });

    describe('token validation', () => {
        test('bearer token is missing', async () => {
            const isAuthenticated = await AuthenticationController.tokenIsValid('');
            expect(isAuthenticated).toBe(false);
        });

        test('bearer token is invalid', async () => {
            const isAuthenticated = await AuthenticationController.tokenIsValid('invalid token');
            expect(isAuthenticated).toBe(false);
        });

        //TODO - test that we are handling expired tokens

        test('token is valid', async () => {
            const idToken = await AuthenticationController.generateValidIdToken(ACCOUNT_THAT_EXISTS, 'password');
            const isAuthenticated = await AuthenticationController.tokenIsValid(`Bearer ${idToken}`);

            expect(isAuthenticated).toBe(true);
        });

        //TODO - test that we are pulling from the cache
    });
});
