import { USER } from '@resources/endpoints';
import { CreateUserRequest, UpdateUserRequest } from '@resources/types/UserTypes';
import app from '@src/app';
import {
    CREATE_USER_ALREADY_EXISTS,
    CREATE_USER_SUCCESS,
    FORBIDDEN,
    GET_USER_FAILED_NOT_FOUND,
    GET_USER_SUCCESS,
    SUCCESS,
    UNAUTHORIZED,
} from '@src/common/RequestResponses';
import { AccountController } from '@src/controller/AccountController';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { UserController } from '@src/controller/UserController';
import { getBearerToken } from '@src/general/auth/BearerTokenUtility';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('user service tests', () => {
    const ACCOUNT_WITH_NO_ROLES = 'us_account_no_roles@embtr.com';
    let USER_ACCOUNT_WITH_NO_ROLES: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE = 'us_account_user_role@embtr.com';
    let USER_ACCOUNT_WITH_USER_ROLE: TestAccountWithUser;

    const ACCOUNT_TO_CREATE_USER = 'us_account_to_create_user@embtr.com';
    const ACCOUNT_TO_CREATE_USER_2 = 'us_account_to_create_user2@embtr.com';
    const ACCOUNT_TO_CREATE_USER_3 = 'us_account_to_create_user3@embtr.com';

    beforeAll(async () => {
        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES);
        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE);

        USER_ACCOUNT_WITH_NO_ROLES = await TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID);
        USER_ACCOUNT_WITH_USER_ROLE = await TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER);

        const deletes = [
            AccountController.delete(ACCOUNT_TO_CREATE_USER),
            AccountController.delete(ACCOUNT_TO_CREATE_USER_2),
            AccountController.delete(ACCOUNT_TO_CREATE_USER_3),
            AccountController.create(ACCOUNT_TO_CREATE_USER, 'password'),
            AccountController.create(ACCOUNT_TO_CREATE_USER_2, 'password'),
            AccountController.create(ACCOUNT_TO_CREATE_USER_3, 'password'),
        ];
        await Promise.all(deletes);
    });

    afterAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_TO_CREATE_USER),
            TestUtility.deleteAccountWithUser(ACCOUNT_TO_CREATE_USER_2),
            TestUtility.deleteAccountWithUser(ACCOUNT_TO_CREATE_USER_3),
        ];
        await Promise.all(deletes);
    });

    describe('get user', () => {
        test('get user with unauthenticated account', async () => {
            const response = await request(app).get(`${USER}/invalid_user`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('get unknown user with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const response = await request(app).get(`${USER}/uid`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('get known user with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const response = await request(app).get(`${USER}/${USER_ACCOUNT_WITH_USER_ROLE.user.uid}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('get self user with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const response = await request(app).get(`${USER}/${USER_ACCOUNT_WITH_NO_ROLES.user.uid}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_USER_SUCCESS.httpCode);
            expect(response.body.user).toBeDefined();
        });

        test('get unknown user with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const response = await request(app).get(`${USER}/invalid_user`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_USER_FAILED_NOT_FOUND.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('get known user with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const response = await request(app).get(`${USER}/${USER_ACCOUNT_WITH_NO_ROLES.user.uid}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_USER_SUCCESS.httpCode);
            expect(response.body.user).toBeDefined();
        });
    });

    describe('create user', () => {
        test('create user with unauthenticated account', async () => {
            const body: CreateUserRequest = {};
            const response = await request(app).post(`${USER}`).send(body);

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('create pre-existing user with authenticated account', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');

            const body: CreateUserRequest = {};
            const response = await request(app).post(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toEqual(CREATE_USER_ALREADY_EXISTS.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('create user with authenticated account', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_TO_CREATE_USER, 'password');

            const body: CreateUserRequest = {};
            const response = await request(app).post(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toEqual(CREATE_USER_SUCCESS.httpCode);
        });

        test('authenticated account sets user role as custom claim', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_TO_CREATE_USER_2, 'password');

            //verify account has no roles
            const initialRoles = await AuthorizationController.getRolesFromToken(getBearerToken(token));
            expect(initialRoles).toEqual([]);

            //create user
            const body: CreateUserRequest = {};
            await request(app).post(`${USER}`).set('Authorization', getBearerToken(token)).send(body);

            const updatedToken = await AuthenticationController.generateValidIdToken(ACCOUNT_TO_CREATE_USER_2, 'password');

            //verify account has user role
            const createdUserRoles = await AuthorizationController.getRolesFromToken(getBearerToken(updatedToken));
            expect(createdUserRoles).toEqual([Role.USER]);
        });

        test('authenticated account sets userId as custom claim', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_TO_CREATE_USER_3, 'password');

            //verify account has no user id
            const userId = await AuthorizationController.getUserIdFromToken(getBearerToken(token));
            expect(userId).toBeUndefined();

            //create user
            const body: CreateUserRequest = {};
            await request(app).post(`${USER}`).set('Authorization', getBearerToken(token)).send(body);

            const updatedToken = await AuthenticationController.generateValidIdToken(ACCOUNT_TO_CREATE_USER_3, 'password');

            //verify account has userId
            const createdUserId = await AuthorizationController.getUserIdFromToken(getBearerToken(updatedToken));
            expect(createdUserId).toBeDefined();
        });
    });

    describe('update user', () => {
        test('unauthenticated', async () => {
            const body: UpdateUserRequest = {};
            const response = await request(app).patch(`${USER}`).send(body);

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
        });

        test('insuffecient permissions', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');

            const body: UpdateUserRequest = {};
            const response = await request(app).patch(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toEqual(FORBIDDEN.httpCode);
        });

        test('success', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const body: UpdateUserRequest = {};
            const response = await request(app).patch(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
        });

        test('update user with sufficient permissions updates user', async () => {
            const randomString = Math.random().toString(36).substring(7);

            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');

            const body: UpdateUserRequest = { displayName: randomString };
            await request(app).patch(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);
            const user = await UserController.getByUid(USER_ACCOUNT_WITH_USER_ROLE.user.uid);

            expect(user?.displayName).toEqual(randomString);
        });

        test('update user with sufficient permissions does not change unmodified fields', async () => {
            const initialLocation = 'Austin, TX';
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');

            await UserController.update(USER_ACCOUNT_WITH_USER_ROLE.user.uid, { location: initialLocation });

            const body: UpdateUserRequest = { displayName: 'displayName' };
            await request(app).patch(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);
            const user = await UserController.getByUid(USER_ACCOUNT_WITH_USER_ROLE.user.uid);

            expect(user?.location).toEqual(initialLocation);
        });
    });
});
