import { PLANNED_DAY } from '@resources/endpoints';
import app from '@src/app';
import { FORBIDDEN, GET_PLANNED_DAY_FAILED_NOT_FOUND, GET_PLANNED_DAY_SUCCESS, UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { RO_NO_ROLE_TEST_USER_EMAIL, RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD } from '@test/util/DedicatedTestUsers';
import request from 'supertest';

const KNOWN_GOOD_PLANNED_DAY_ID = '1';

describe('planned day service', () => {
    describe('get planned day', () => {
        test('get planned day with unauthenticated account', async () => {
            const response = await request(app).get(`${PLANNED_DAY}1`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown plannedDay with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${PLANNED_DAY}99999999`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get known plannedDay with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_ID}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get invalid plannedDay with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${PLANNED_DAY}hello`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get unknown plannedDay with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${PLANNED_DAY}99999999`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get known task with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_ID}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_PLANNED_DAY_SUCCESS.httpCode);
            expect(response.body.plannedDay).toBeDefined();
        });
    });
});
