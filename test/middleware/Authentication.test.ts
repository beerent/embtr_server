import { AuthenticationController } from '@src/controller/AuthenticationController';
import { AccountController } from '@src/controller/AccountController';
import { UserController } from '@src/controller/UserController';
import { TestUtility } from '@test/test_utility/TestUtility';

describe('Authentication middleware', () => {
    const ACCOUNT_THAT_EXISTS = 'auth_m_email_that_exists@embtr.com';

    beforeAll(async () => {
        const deletes = [AccountController.delete(ACCOUNT_THAT_EXISTS), UserController.deleteByEmail(ACCOUNT_THAT_EXISTS)];
        await Promise.all(deletes);

        const accountCreates = [AccountController.create(ACCOUNT_THAT_EXISTS, 'password')];
        await Promise.all(accountCreates);

        const account = await AccountController.get(ACCOUNT_THAT_EXISTS);
        const uid = account!.uid!;

        const userCreates = [UserController.create(uid, ACCOUNT_THAT_EXISTS)];
        await Promise.all(userCreates);
    });

    afterAll(async () => {
        const deletes = [AccountController.delete(ACCOUNT_THAT_EXISTS), UserController.deleteByEmail(ACCOUNT_THAT_EXISTS)];
        await Promise.all(deletes);
    });

    test('adds userId to custom claims and returns 401', async () => {
        // initial account does not have db userId in custom claims
        const initialToken = await AuthenticationController.generateValidIdToken(ACCOUNT_THAT_EXISTS, 'password');
        const initialResponse = await TestUtility.sendAuthRequest(initialToken);
        expect(initialResponse.status).toHaveBeenCalledWith(401);

        // after an auth attempt, the custom claims should be updated
        const token = await AuthenticationController.generateValidIdToken(ACCOUNT_THAT_EXISTS, 'password');
        const finalResponse = await TestUtility.sendAuthRequest(token);
        expect(finalResponse.status).not.toHaveBeenCalled();
    });
});
