import { DAY_RESULT } from '@resources/endpoints';
import { GetDayResultResponse } from '@resources/types/DayResultTypes';
import app from '@src/app';
import { FORBIDDEN, GET_DAY_RESULT_INVALID, GET_DAY_RESULT_SUCCESS, GET_DAY_RESULT_UNKNOWN, UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { DayResultController } from '@src/controller/DayResultController';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { TaskController } from '@src/controller/TaskController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('DayResultServices', () => {
    const ACCOUNT_WITH_NO_ROLES = 'drs_account_no_roles@embtr.com';
    let ACCOUNT_WITH_NO_ROLES_TOKEN: string;

    const ACCOUNT_WITH_USER_ROLE = 'drs_account_user_roles@embtr.com';
    let ACCOUNT_WITH_USER_ROLE_TOKEN: string;
    let ACCOUNT_USER_WITH_USER_ROLE: TestAccountWithUser;

    const TEST_PLANNED_DAY_DATE = '0100-01-01';
    const TEST_TASK_TITLE = 'DRS Test Task';
    let TEST_DAY_RESULT_ID: number;

    beforeAll(async () => {
        const deletes = [TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES), TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE)];
        await Promise.all(deletes);

        const creates = [
            TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER),
        ];
        const [account1, account2] = await Promise.all(creates);
        ACCOUNT_USER_WITH_USER_ROLE = account2;

        const authenticates = [
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password'),
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password'),
        ];
        const [token1, token2] = await Promise.all(authenticates);
        ACCOUNT_WITH_NO_ROLES_TOKEN = token1;
        ACCOUNT_WITH_USER_ROLE_TOKEN = token2;

        await TaskController.deleteByTitle(TEST_TASK_TITLE);
        const task = await TaskController.create(TEST_TASK_TITLE);
        const plannedDay = await PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, new Date(TEST_PLANNED_DAY_DATE), TEST_PLANNED_DAY_DATE);
        await PlannedTaskController.create(plannedDay, task!);

        const dayResult = await DayResultController.create(plannedDay);
        TEST_DAY_RESULT_ID = dayResult.id;
    });

    afterAll(async () => {
        const deletes = [TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES), TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE)];
        await Promise.all(deletes);

        await TaskController.deleteByTitle(TEST_TASK_TITLE);
    });

    describe('get by id', () => {
        test('unauthenticated', async () => {
            const response = await request(app).get(`${DAY_RESULT}id`).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app).get(`${DAY_RESULT}id`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app).get(`${DAY_RESULT}invalid`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send({});

            expect(response.status).toEqual(GET_DAY_RESULT_INVALID.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('non-existing day result', async () => {
            const response = await request(app).get(`${DAY_RESULT}0`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send({});

            expect(response.status).toEqual(GET_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app)
                .get(`${DAY_RESULT}${TEST_DAY_RESULT_ID}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({});

            expect(response.status).toEqual(GET_DAY_RESULT_SUCCESS.httpCode);
            const responseObject: GetDayResultResponse = response.body;
            expect(responseObject!.dayResult!.id).toEqual(TEST_DAY_RESULT_ID);
        });
    });

    describe('get by user and dayKey', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get(`${DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE}`)
                .set('Authorization', 'Bearer Trash')
                .send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get(`${DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app)
                .get(`${DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/a}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({});

            expect(response.status).toEqual(GET_DAY_RESULT_INVALID.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('non-existing day result', async () => {
            const response = await request(app)
                .get(`${DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/3000-01-01}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({});

            expect(response.status).toEqual(GET_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app)
                .get(`${DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({});

            expect(response.status).toEqual(GET_DAY_RESULT_SUCCESS.httpCode);
            const responseObject: GetDayResultResponse = response.body;
            expect(responseObject!.dayResult!.id).toEqual(TEST_DAY_RESULT_ID);
        });
    });
});
