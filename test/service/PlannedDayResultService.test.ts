import { PLANNED_DAY_RESULT } from '@resources/endpoints';
import { GetPlannedDayResultResponse, GetPlannedDayResultsResponse, UpdatePlannedDayResultRequest } from '@resources/types/PlannedDayResultTypes';
import app from '@src/app';
import {
    CREATE_DAY_RESULT_FAILED,
    CREATE_DAY_RESULT_INVALID,
    FORBIDDEN,
    GET_DAY_RESULTS_SUCCESS,
    GET_DAY_RESULT_INVALID,
    GET_DAY_RESULT_SUCCESS,
    GET_DAY_RESULT_UNKNOWN,
    SUCCESS,
    UNAUTHORIZED,
    UPDATE_PLANNED_DAY_RESULT_INVALID,
    UPDATE_PLANNED_DAY_RESULT_UNKNOWN,
} from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';
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

    const ACCOUNT_WITH_USER_ROLE_2 = 'drs_account_user_roles_2@embtr.com';
    let ACCOUNT_WITH_USER_ROLE_2_TOKEN: string;
    let ACCOUNT_USER_WITH_USER_ROLE_2: TestAccountWithUser;

    const TEST_PLANNED_DAY_DATE_TO_CREATE_RESULT = '0100-01-02';
    let TEST_PLANNED_DAY_TO_CREATE_RESULT_ID: number;

    const TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT = '0100-01-01';
    const TEST_TASK_TITLE = 'DRS Test Task';
    let TEST_EXISTING_PLANNED_DAY_RESULT_ID: number;

    beforeAll(async () => {
        //user deletes
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2),
        ];
        await Promise.all(deletes);

        //user creates
        const creates = [
            TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE_2, 'password', Role.USER),
        ];
        const [account1, account2, account3] = await Promise.all(creates);
        ACCOUNT_USER_WITH_USER_ROLE = account2;
        ACCOUNT_USER_WITH_USER_ROLE_2 = account3;

        //user authenticates
        const authenticates = [
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password'),
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password'),
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE_2, 'password'),
        ];
        const [token1, token2, token3] = await Promise.all(authenticates);
        ACCOUNT_WITH_NO_ROLES_TOKEN = token1;
        ACCOUNT_WITH_USER_ROLE_TOKEN = token2;
        ACCOUNT_WITH_USER_ROLE_2_TOKEN = token3;

        //planned days
        const plannedDayCreates = [
            PlannedDayController.create(
                ACCOUNT_USER_WITH_USER_ROLE.user.id,
                new Date(TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT),
                TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT
            ),
            PlannedDayController.create(
                ACCOUNT_USER_WITH_USER_ROLE.user.id,
                new Date(TEST_PLANNED_DAY_DATE_TO_CREATE_RESULT),
                TEST_PLANNED_DAY_DATE_TO_CREATE_RESULT
            ),
        ];
        const [plannedDay, plannedDayToCreateResult] = await Promise.all(plannedDayCreates);
        TEST_PLANNED_DAY_TO_CREATE_RESULT_ID = plannedDayToCreateResult.id;

        //tasks
        await TaskController.deleteByTitle(TEST_TASK_TITLE);
        const task = await TaskController.create(TEST_TASK_TITLE);
        await PlannedTaskController.create(plannedDay, task!);

        const dayResult = await PlannedDayResultController.create(plannedDay.id);
        TEST_EXISTING_PLANNED_DAY_RESULT_ID = dayResult.id;
    });

    afterAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2),
        ];
        await Promise.all(deletes);

        await TaskController.deleteByTitle(TEST_TASK_TITLE);
    });

    describe('get by id', () => {
        test('unauthenticated', async () => {
            const response = await request(app).get(`${PLANNED_DAY_RESULT}id`).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app).get(`${PLANNED_DAY_RESULT}id`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app).get(`${PLANNED_DAY_RESULT}invalid`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send({});

            expect(response.status).toEqual(GET_DAY_RESULT_INVALID.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('non-existing day result', async () => {
            const response = await request(app).get(`${PLANNED_DAY_RESULT}0`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send({});

            expect(response.status).toEqual(GET_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${TEST_EXISTING_PLANNED_DAY_RESULT_ID}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GET_DAY_RESULT_SUCCESS.httpCode);
            const responseObject: GetPlannedDayResultResponse = response.body;
            expect(responseObject!.plannedDayResult!.id).toEqual(TEST_EXISTING_PLANNED_DAY_RESULT_ID);
        });
    });

    describe('get by user and dayKey', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT}`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/a}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GET_DAY_RESULT_INVALID.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('non-existing day result', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/3000-01-01}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GET_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GET_DAY_RESULT_SUCCESS.httpCode);
            const responseObject: GetPlannedDayResultResponse = response.body;
            expect(responseObject!.plannedDayResult!.id).toEqual(TEST_EXISTING_PLANNED_DAY_RESULT_ID);
        });
    });

    describe('get all', () => {
        test('unauthenticated', async () => {
            const response = await request(app).get(`${PLANNED_DAY_RESULT}`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app).get(`${PLANNED_DAY_RESULT}`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app).get(`${PLANNED_DAY_RESULT}`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(GET_DAY_RESULTS_SUCCESS.httpCode);
            const responseObject: GetPlannedDayResultsResponse = response.body;
            expect(responseObject!.plannedDayResults!.length).toBeGreaterThan(1);
        });
    });

    describe('create', () => {
        test('unauthenticated', async () => {
            const response = await request(app).post(PLANNED_DAY_RESULT).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app).post(PLANNED_DAY_RESULT).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({ plannedDayId: 'invalid' });

            expect(response.status).toEqual(CREATE_DAY_RESULT_INVALID.httpCode);
            expect(response.body).toEqual(CREATE_DAY_RESULT_INVALID);
        });

        test('does not exist', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({ plannedDayId: 0 });

            expect(response.status).toEqual(CREATE_DAY_RESULT_FAILED.httpCode);
            expect(response.body).toEqual(CREATE_DAY_RESULT_FAILED);
        });

        test('valid', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({ plannedDayId: TEST_PLANNED_DAY_TO_CREATE_RESULT_ID });

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.plannedDayResult).toBeDefined();
        });
    });

    describe('update', () => {
        test('unauthenticated', async () => {
            const response = await request(app).patch(PLANNED_DAY_RESULT).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app).patch(PLANNED_DAY_RESULT).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({
                    plannedDayResult: {
                        id: 'invalid',
                    },
                });

            expect(response.status).toEqual(UPDATE_PLANNED_DAY_RESULT_INVALID.httpCode);
            expect(response.body).toEqual(UPDATE_PLANNED_DAY_RESULT_INVALID);
        });

        test('does not exist', async () => {
            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({
                    plannedDayResult: {
                        id: 0,
                    },
                });

            expect(response.status).toEqual(UPDATE_PLANNED_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body).toEqual(UPDATE_PLANNED_DAY_RESULT_UNKNOWN);
        });

        test('does not belong to user', async () => {
            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_2_TOKEN}`)
                .send({
                    plannedDayResult: {
                        id: TEST_EXISTING_PLANNED_DAY_RESULT_ID,
                    },
                });

            expect(response.status).toEqual(UPDATE_PLANNED_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body).toEqual(UPDATE_PLANNED_DAY_RESULT_UNKNOWN);
        });

        test('valid', async () => {
            const randomString = Math.random().toString(36).substring(7);
            const body: UpdatePlannedDayResultRequest = {
                plannedDayResult: {
                    id: TEST_EXISTING_PLANNED_DAY_RESULT_ID,
                    description: randomString,
                },
            };

            const response = await request(app).patch(PLANNED_DAY_RESULT).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.plannedDayResult).toBeDefined();
            expect(response.body.plannedDayResult.description).toEqual(randomString);
        });

        test.skip('can upload image', async () => {
            const randomString = Math.random().toString(36).substring(7);
            const body: UpdatePlannedDayResultRequest = {
                plannedDayResult: {
                    id: TEST_EXISTING_PLANNED_DAY_RESULT_ID,
                    description: randomString,
                },
            };

            const response = await request(app).patch(PLANNED_DAY_RESULT).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.plannedDayResult).toBeDefined();
            expect(response.body.plannedDayResult.description).toEqual(randomString);
        });
    });
});
