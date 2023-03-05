import { USER } from '@resources/endpoints';
import { CreateUserRequest, UpdateUserRequest } from '@resources/types';
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
import {
    RO_NO_ROLE_TEST_USER_EMAIL,
    RO_NO_ROLE_TEST_USER_UID,
    RO_USER_ROLE_TEST_USER_EMAIL,
    RO_USER_ROLE_TEST_USER_UID,
    RW_NO_ROLE_TEST_USER_EMAIL,
    RW_USER_ROLE_TEST_USER_EMAIL,
    RW_USER_ROLE_TEST_USER_UID,
    TEST_USER_PASSWORD,
} from '@test/util/DedicatedTestUsers';
import request from 'supertest';

describe('user service tests', () => {
    describe('get user', () => {
        test('get user with unauthenticated account', async () => {
            const response = await request(app).get(`${USER}/invalid_user`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('get unknown user with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, 'password');
            const response = await request(app).get(`${USER}/uid`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('get known user with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, 'password');
            const response = await request(app).get(`${USER}/${RO_USER_ROLE_TEST_USER_UID}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('get self user with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${USER}/${RO_NO_ROLE_TEST_USER_UID}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_USER_SUCCESS.httpCode);
            expect(response.body.user).toBeDefined();
        });

        test('get unknown user with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${USER}/invalid_user`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_USER_FAILED_NOT_FOUND.httpCode);
            expect(response.body.user).toBeUndefined();
        });

        test('get known user with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${USER}/${RO_NO_ROLE_TEST_USER_UID}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_USER_SUCCESS.httpCode);
            expect(response.body.user).toBeDefined();
        });
    });

    describe('create user', () => {
        describe('fail cases', () => {
            test('create user with unauthenticated account', async () => {
                const body: CreateUserRequest = {};
                const response = await request(app).post(`${USER}`).send(body);

                expect(response.status).toEqual(UNAUTHORIZED.httpCode);
                expect(response.body.user).toBeUndefined();
            });

            test('create pre-existing user with authenticated account', async () => {
                const token = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: CreateUserRequest = {};
                const response = await request(app).post(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(CREATE_USER_ALREADY_EXISTS.httpCode);
                expect(response.body.user).toBeUndefined();
            });
        });

        describe('success cases', () => {
            const email = 'create_user_test@embtr.com';

            beforeEach(async () => {
                await UserController.deleteByEmail(email);
                await AccountController.delete(email);
                await AccountController.create(email, TEST_USER_PASSWORD);
            });

            test('create user with authenticated account', async () => {
                const token = await AuthenticationController.generateValidIdToken(email, TEST_USER_PASSWORD);

                const body: CreateUserRequest = {};
                const response = await request(app).post(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(CREATE_USER_SUCCESS.httpCode);
            });

            test('with authenticated account sets user role as custom claim', async () => {
                const token = await AuthenticationController.generateValidIdToken(email, TEST_USER_PASSWORD);

                //verify account has no roles
                const initialRoles = await AuthorizationController.getRolesFromToken(getBearerToken(token));
                expect(initialRoles).toEqual([]);

                //create user
                const body: CreateUserRequest = {};
                await request(app).post(`${USER}`).set('Authorization', getBearerToken(token)).send(body);

                const updatedToken = await AuthenticationController.generateValidIdToken(email, TEST_USER_PASSWORD);

                //verify account has user role
                const createdUserRoles = await AuthorizationController.getRolesFromToken(getBearerToken(updatedToken));
                expect(createdUserRoles).toEqual([Role.USER]);
            });

            test('with authenticated account sets userId as custom claim', async () => {
                const token = await AuthenticationController.generateValidIdToken(email, TEST_USER_PASSWORD);

                //verify account has no user id
                const userId = await AuthorizationController.getUserIdFromToken(getBearerToken(token));
                expect(userId).toBeUndefined();

                //create user
                const body: CreateUserRequest = {};
                await request(app).post(`${USER}`).set('Authorization', getBearerToken(token)).send(body);

                const updatedToken = await AuthenticationController.generateValidIdToken(email, TEST_USER_PASSWORD);

                //verify account has userId
                const createdUserId = await AuthorizationController.getUserIdFromToken(getBearerToken(updatedToken));
                expect(createdUserId).toBeDefined();
            });
        });
    });

    describe('update user', () => {
        describe('fail cases', () => {
            test('update user with unauthenticated account', async () => {
                const body: UpdateUserRequest = {};
                const response = await request(app).patch(`${USER}`).send(body);

                expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            });

            test('update user with insuffecient permissions', async () => {
                const token = await AuthenticationController.generateValidIdToken(RW_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: UpdateUserRequest = {};
                const response = await request(app).patch(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(FORBIDDEN.httpCode);
            });
        });

        describe('success cases', () => {
            test('update user with sufficient permissions returns success', async () => {
                const token = await AuthenticationController.generateValidIdToken(RW_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
                const body: UpdateUserRequest = {};
                const response = await request(app).patch(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(SUCCESS.httpCode);
            });

            test('update user with sufficient permissions updates user', async () => {
                const randomString = Math.random().toString(36).substring(7);

                const token = await AuthenticationController.generateValidIdToken(RW_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: UpdateUserRequest = { displayName: randomString };
                await request(app).patch(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);
                const user = await UserController.getByUid(RW_USER_ROLE_TEST_USER_UID);

                expect(user?.displayName).toEqual(randomString);
            });

            test('update user with sufficient permissions does not change unmodified fields', async () => {
                const initialLocation = 'Austin, TX';
                const token = await AuthenticationController.generateValidIdToken(RW_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                await UserController.update(RW_USER_ROLE_TEST_USER_UID, { location: initialLocation });

                const body: UpdateUserRequest = { displayName: 'displayName' };
                await request(app).patch(`${USER}`).set('Authorization', `Bearer ${token}`).send(body);
                const user = await UserController.getByUid(RW_USER_ROLE_TEST_USER_UID);

                expect(user?.location).toEqual(initialLocation);
            });
        });
    });
});
