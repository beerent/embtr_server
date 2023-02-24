import { USER } from '@resources/endpoints';
import { CreateUserRequest } from '@resources/types';
import app from '@src/app';
import {
    CREATE_USER_ALREADY_EXISTS,
    CREATE_USER_SUCCESS,
    FORBIDDEN,
    GET_USER_FAILED_NOT_FOUND,
    GET_USER_SUCCESS,
    RESOURCE_NOT_FOUND,
    UNAUTHORIZED,
} from '@src/common/RequestResponses';
import { AccountController } from '@src/controller/AccountController';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { UserController } from '@src/controller/UserController';
import {
    RO_NO_ROLE_TEST_USER_EMAIL,
    RO_NO_ROLE_TEST_USER_UID,
    RO_USER_ROLE_TEST_USER_EMAIL,
    RO_USER_ROLE_TEST_USER_UID,
    TEST_USER_PASSWORD,
} from '@test/util/DedicatedTestUsers';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
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

            beforeAll(async () => {
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
        });
    });
});
