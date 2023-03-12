import { AccountController, CreateAccountResult } from '@src/controller/AccountController';
import { CREATE_ACCOUNT_EMAIL_IN_USE, CREATE_ACCOUNT_INVALID_EMAIL, CREATE_ACCOUNT_INVALID_PASSWORD, SUCCESS } from '@src/common/RequestResponses';
import { Role } from '@src/roles/Roles';

describe('account', () => {
    const ACCOUNT_THAT_EXISTS = 'acc_ct_email_that_exists@embtr.com';
    const ACCOUNT_TO_DELETE = 'acc_ct_email_to_delete@embtr.com';
    const ACCOUNT_TO_CREATE = 'acc_ct_email_to_create@embtr.com';
    const ACCOUNT_TO_ADD_ROLES = 'acc_ct_email_to_add_roles@embtr.com';
    const ACCOUNT_TO_UPDATE_ROLES = 'acc_ct_email_to_update_roles@embtr.com';

    beforeAll(async () => {
        const deletes = [
            AccountController.delete(ACCOUNT_THAT_EXISTS),
            AccountController.delete(ACCOUNT_TO_DELETE),
            AccountController.delete(ACCOUNT_TO_CREATE),
            AccountController.delete(ACCOUNT_TO_ADD_ROLES),
            AccountController.delete(ACCOUNT_TO_UPDATE_ROLES),
        ];
        await Promise.all(deletes);

        const creates = [
            AccountController.create(ACCOUNT_THAT_EXISTS, 'password'),
            AccountController.create(ACCOUNT_TO_DELETE, 'password'),
            AccountController.create(ACCOUNT_TO_ADD_ROLES, 'password'),
            AccountController.create(ACCOUNT_TO_UPDATE_ROLES, 'password'),
        ];
        await Promise.all(creates);
    });

    afterAll(async () => {
        const deletes = [
            AccountController.delete(ACCOUNT_THAT_EXISTS),
            AccountController.delete(ACCOUNT_TO_DELETE),
            AccountController.delete(ACCOUNT_TO_CREATE),
            AccountController.delete(ACCOUNT_TO_ADD_ROLES),
            AccountController.delete(ACCOUNT_TO_UPDATE_ROLES),
        ];
        await Promise.all(deletes);
    });

    describe('create account', () => {
        test('email is empty', async () => {
            const result: CreateAccountResult = await AccountController.create('', 'password');
            expect(result.code).toEqual(CREATE_ACCOUNT_INVALID_EMAIL.internalCode);
        });

        test('email is invalid', async () => {
            const result: CreateAccountResult = await AccountController.create('email', 'password');
            expect(result.code).toEqual(CREATE_ACCOUNT_INVALID_EMAIL.internalCode);
        });

        test('password is empty', async () => {
            const result: CreateAccountResult = await AccountController.create('validemail@embtr.com', '');
            expect(result.code).toEqual(CREATE_ACCOUNT_INVALID_PASSWORD.internalCode);
        });

        test('password is invalid', async () => {
            const result: CreateAccountResult = await AccountController.create('validemail@embtr.com', 'pass');
            expect(result.code).toEqual(CREATE_ACCOUNT_INVALID_PASSWORD.internalCode);
        });

        test('email is in use', async () => {
            const result: CreateAccountResult = await AccountController.create(ACCOUNT_THAT_EXISTS, 'password');
            expect(result.code).toEqual(CREATE_ACCOUNT_EMAIL_IN_USE.internalCode);
        });

        test('create an account', async () => {
            const result: CreateAccountResult = await AccountController.create(ACCOUNT_TO_CREATE, 'password');
            expect(result.code).toEqual(SUCCESS.internalCode);
        });
    });

    describe('get account', () => {
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

        test('get a account', async () => {
            const result = await AccountController.get(ACCOUNT_THAT_EXISTS);
            expect(result?.email).toEqual(ACCOUNT_THAT_EXISTS);
        });
    });

    describe('delete account', () => {
        test('delete an account', async () => {
            await AccountController.delete(ACCOUNT_TO_DELETE);
            const account = await AccountController.get(ACCOUNT_TO_DELETE);
            expect(account).toBeUndefined();
        });
    });

    describe('update account roles', () => {
        test('can update roles', async () => {
            const account = await AccountController.get(ACCOUNT_TO_ADD_ROLES);
            expect(account!.customClaims).toBeFalsy();

            await AccountController.updateAccountRoles(account!.uid, [Role.ADMIN]);
            const updatedaccount = await AccountController.get(ACCOUNT_TO_ADD_ROLES);
            expect(updatedaccount!.customClaims!.roles).toEqual([Role.ADMIN]);
        });

        test('update roles does not clear other claims', async () => {
            const account = await AccountController.get(ACCOUNT_TO_ADD_ROLES);
            await AccountController.updateCustomClaim(account!.uid, 'key', 'value');

            let updatedAccount = await AccountController.get(ACCOUNT_TO_ADD_ROLES);
            expect(updatedAccount!.customClaims!.key).toEqual('value');

            await AccountController.updateAccountRoles(account!.uid, [Role.ADMIN]);
            updatedAccount = await AccountController.get(ACCOUNT_TO_ADD_ROLES);
            expect(updatedAccount!.customClaims!.key).toEqual('value');
        });
    });

    describe('update custom claims', () => {
        test('can update custom claims', async () => {
            const account = await AccountController.get(ACCOUNT_TO_UPDATE_ROLES);
            expect(account!.customClaims).toBeFalsy();

            await AccountController.updateCustomClaim(account!.uid, 'testClaim', 'testValue');
            const updatedaccount = await AccountController.get(ACCOUNT_TO_UPDATE_ROLES);
            expect(updatedaccount!.customClaims!.testClaim).toEqual('testValue');
        });
    });
});
