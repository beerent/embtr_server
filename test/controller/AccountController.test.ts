import { AccountController, CreateAccountResult } from '@src/controller/AccountController';
import { CREATE_ACCOUNT_EMAIL_IN_USE, CREATE_ACCOUNT_INVALID_EMAIL, CREATE_ACCOUNT_INVALID_PASSWORD, SUCCESS } from '@src/common/RequestResponses';
import { Role } from '@src/roles/Roles';

describe('create account', () => {
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
        const email = 'test_create_account@embtr.com';
    });

    describe('success case', () => {
        const email = 'create_account_test@embtr.com';

        afterAll(async () => {
            await AccountController.delete(email);
        });

        test('create a account', async () => {
            const result: CreateAccountResult = await AccountController.create(email, 'password');
            expect(result.code).toEqual(SUCCESS.internalCode);
        });
    });
});

describe('get account', () => {
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
        test('get a account', async () => {
            const result = await AccountController.get('brent@embtr.com');
            expect(result?.email).toEqual('brent@embtr.com');
        });
    });
});

describe('delete account', () => {
    const email = 'test_delete_email@embtr.com';

    beforeAll(async () => {
        await AccountController.create(email, 'password');
    });

    describe('success cases', () => {
        test('delete an account', async () => {
            await AccountController.delete(email);
            const account = await AccountController.get(email);
            expect(account).toBeUndefined();
        });
    });
});

describe('update account roles', () => {
    const email = 'update_roles_test@embtr.com';

    beforeEach(async () => {
        await AccountController.delete(email);
        await AccountController.create(email, 'password');
    });

    test('can update roles', async () => {
        const account = await AccountController.get(email);

        expect(account!.customClaims).toBeFalsy();
        await AccountController.updateAccountRoles(account!.uid, [Role.ADMIN]);
        const updatedaccount = await AccountController.get(email);
        expect(updatedaccount!.customClaims!.roles).toEqual([Role.ADMIN]);
    });
});
