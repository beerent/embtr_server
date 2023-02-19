import { AccountController, CreateAccountResult } from '@src/controller/AccountController';
import { CREATE_ACCOUNT_EMAIL_IN_USE, CREATE_ACCOUNT_INVALID_EMAIL, CREATE_ACCOUNT_INVALID_PASSWORD, SUCCESS } from '@src/common/RequestResponses';

describe('create user', () => {
    describe('fail cases', () => {
        test('email is empty', async () => {
            const result: CreateAccountResult = await AccountController.create('', 'password');
            expect(result.code).toEqual(CREATE_ACCOUNT_INVALID_EMAIL.internalCode);
        });

        test('email is invalid', async () => {
            const result: CreateAccountResult = await AccountController.create('email', 'password');
            expect(result.code).toEqual(CREATE_ACCOUNT_INVALID_EMAIL.internalCode);
        });

        test('password is empty', async () => {
            const result: CreateAccountResult = await AccountController.create(email, '');
            expect(result.code).toEqual(CREATE_ACCOUNT_INVALID_PASSWORD.internalCode);
        });

        test('password is invalid', async () => {
            const result: CreateAccountResult = await AccountController.create(email, 'pass');
            expect(result.code).toEqual(CREATE_ACCOUNT_INVALID_PASSWORD.internalCode);
        });

        test('email is in use', async () => {
            const result: CreateAccountResult = await AccountController.create('brent@embtr.com', 'password');
            expect(result.code).toEqual(CREATE_ACCOUNT_EMAIL_IN_USE.internalCode);
        });
        const email = 'test_create_user@embtr.com';
    });

    describe('success case', () => {
        const email = 'create_user_test@embtr.com';

        afterAll(async () => {
            await AccountController.delete(email);
        });

        test('create a user', async () => {
            const result: CreateAccountResult = await AccountController.create(email, 'password');
            expect(result.code).toEqual(SUCCESS.internalCode);
        });
    });
});

describe('get user', () => {
    describe('fail cases', () => {
        test('email is empty', async () => {
            const result = await AccountController.get('');
            expect(result).toBeUndefined();
        });

        test('email is invalid', async () => {
            const result = await AccountController.get('email');
            expect(result).toBeUndefined();
        });

        test('email is not in use', async () => {
            const result = await AccountController.get('test_unknown_email@embtr.com');
            expect(result).toBeUndefined();
        });
    });

    describe('success case', () => {
        test('get a user', async () => {
            const result = await AccountController.get('brent@embtr.com');
        });
    });
});

// test delete
describe('delete user', () => {
    const email = 'test_delete_email@embtr.com';

    beforeAll(async () => {
        await AccountController.create(email, 'password');
    });

    describe('success cases', () => {
        test('delete a user', async () => {
            await AccountController.delete(email);
            const user = await AccountController.get(email);
            expect(user).toBeUndefined();
        });
    });
});
