import { USER } from '@resources/endpoints';
import app from '@src/app';
import { FORBIDDEN, GET_USER_FAILED_NOT_FOUND, GET_USER_SUCCESS, RESOURCE_NOT_FOUND, UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import {
    RO_NO_ROLE_TEST_USER_EMAIL,
    RO_NO_ROLE_TEST_USER_UID,
    RO_USER_ROLE_TEST_USER_EMAIL,
    RO_USER_ROLE_TEST_USER_UID,
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
});
