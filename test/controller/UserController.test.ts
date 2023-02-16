import { UserController, CreateUserResult } from '@src/controller/UserController';
import { CREATE_USER_EMAIL_IN_USE, CREATE_USER_INVALID_EMAIL, CREATE_USER_INVALID_PASSWORD, SUCCESS } from '@src/common/RequestResponses';

describe('create user', () => {
    describe('fail cases', () => {
        test('email is empty', async () => {
            const result: CreateUserResult = await UserController.create('', 'password');
            expect(result.code).toEqual(CREATE_USER_INVALID_EMAIL.internalCode);
        });

        test('email is invalid', async () => {
            const result: CreateUserResult = await UserController.create('email', 'password');
            expect(result.code).toEqual(CREATE_USER_INVALID_EMAIL.internalCode);
        });

        test('password is empty', async () => {
            const result: CreateUserResult = await UserController.create(email, '');
            expect(result.code).toEqual(CREATE_USER_INVALID_PASSWORD.internalCode);
        });

        test('password is invalid', async () => {
            const result: CreateUserResult = await UserController.create(email, 'pass');
            expect(result.code).toEqual(CREATE_USER_INVALID_PASSWORD.internalCode);
        });

        test('email is in use', async () => {
            const result: CreateUserResult = await UserController.create('brent@embtr.com', 'password');
            expect(result.code).toEqual(CREATE_USER_EMAIL_IN_USE.internalCode);
        });
        const email = 'test_create_user@embtr.com';
    });

    describe('success case', () => {
        const email = 'create_user_test@embtr.com';

        afterAll(async () => {
            await UserController.delete(email);
        });

        test('create a user', async () => {
            const result: CreateUserResult = await UserController.create(email, 'password');
            expect(result.code).toEqual(SUCCESS.internalCode);
        });
    });
});

describe('get user', () => {
    describe('fail cases', () => {
        test('email is empty', async () => {
            const result = await UserController.get('');
            expect(result).toBeUndefined();
        });

        test('email is invalid', async () => {
            const result = await UserController.get('email');
            expect(result).toBeUndefined();
        });

        test('email is not in use', async () => {
            const result = await UserController.get('test_unknown_email@embtr.com');
            expect(result).toBeUndefined();
        });
    });

    describe('success case', () => {
        test('get a user', async () => {
            const result = await UserController.get('brent@embtr.com');
        });
    });
});

// test delete
describe('delete user', () => {
    const email = 'test_delete_email@embtr.com';

    beforeAll(async () => {
        await UserController.create(email, 'password');
    });

    describe('success cases', () => {
        test('delete a user', async () => {
            await UserController.delete(email);
            const user = await UserController.get(email);
            expect(user).toBeUndefined();
        });
    });
});
