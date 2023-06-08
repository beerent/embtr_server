import { GetDailyHistoryRequest, GetDailyHistoryResponse } from '@resources/types/requests/DailyHistoryTypes';
import app from '@src/app';
import { FORBIDDEN, INVALID_REQUEST, RESOURCE_NOT_FOUND, SUCCESS, UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { TaskController } from '@src/controller/TaskController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('DailyHistoryService', () => {
    const EMAIL_WITH_NO_ROLE = 'dhs_account_no_role@embtr.com';
    let ACCOUNT_USER_WITH_NO_ROLE: TestAccountWithUser;
    let ACCOUNT_WITH_NO_ROLE_TOKEN: string;

    const EMAIL_WITH_USER_ROLE = 'dhs_account_user_role@embtr.com';
    let ACCOUNT_USER_WITH_USER_ROLE: TestAccountWithUser;
    let ACCOUNT_WITH_USER_ROLE_TOKEN: string;

    beforeAll(async () => {
        // DELETE
        const userAccountDeletes = [TestUtility.deleteAccountWithUser(EMAIL_WITH_NO_ROLE), TestUtility.deleteAccountWithUser(EMAIL_WITH_USER_ROLE)];
        await Promise.all(userAccountDeletes);

        // CREATE
        const creates = [
            TestUtility.createAccountWithUser(EMAIL_WITH_NO_ROLE, 'password', Role.NONE),
            TestUtility.createAccountWithUser(EMAIL_WITH_USER_ROLE, 'password', Role.USER),
        ];
        const [c1, c2] = await Promise.all(creates);
        ACCOUNT_USER_WITH_NO_ROLE = c1;
        ACCOUNT_USER_WITH_USER_ROLE = c2;

        // AUTHENTICATE
        const tokenGenerations = [
            AuthenticationController.generateValidIdToken(EMAIL_WITH_NO_ROLE, 'password'),
            AuthenticationController.generateValidIdToken(EMAIL_WITH_USER_ROLE, 'password'),
        ];
        const [t1, t2] = await Promise.all(tokenGenerations);
        ACCOUNT_WITH_NO_ROLE_TOKEN = t1;
        ACCOUNT_WITH_USER_ROLE_TOKEN = t2;
    });

    afterAll(async () => {
        const userAccountDeletes = [TestUtility.deleteAccountWithUser(EMAIL_WITH_NO_ROLE), TestUtility.deleteAccountWithUser(EMAIL_WITH_USER_ROLE)];
        await Promise.all(userAccountDeletes);
    });

    test('unauthenticated', async () => {
        const response = await request(app).get('/user/0/daily-history').set('Authorization', 'Bearer Trash').send();
        expect(response.status).toEqual(UNAUTHORIZED.httpCode);
    });

    test('unauthorized', async () => {
        const response = await request(app).get('/user/0/daily-history').set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLE_TOKEN}`).send();

        expect(response.status).toEqual(FORBIDDEN.httpCode);
        expect(response.body).toEqual(FORBIDDEN);
    });

    test('invalid id', async () => {
        const response = await request(app).get(`/user/abc/daily-history`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();
        expect(response.status).toEqual(INVALID_REQUEST.httpCode);
    });

    test('missing dates', async () => {
        const response = await request(app).get(`/user/0/daily-history`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).query({}).send();
        expect(response.status).toEqual(INVALID_REQUEST.httpCode);
    });

    test('invalid dates', async () => {
        const response = await request(app)
            .get(`/user/0/daily-history`)
            .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
            .query({ start: 'abc', end: 'xyz' })
            .send();
        expect(response.status).toEqual(INVALID_REQUEST.httpCode);
    });

    test('user not found', async () => {
        const response = await request(app)
            .get(`/user/0/daily-history`)
            .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
            .query({ start: '2020-01-01', end: '2021-01-01' })
            .send();
        expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
    });

    describe('no tasks on a given day results in an incomplete day', () => {
        const TEST_EXISTING_TASK_TITLE = 'dhs test task 1';

        beforeAll(async () => {
            await TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE);

            const task = await TaskController.create(TEST_EXISTING_TASK_TITLE);

            const plannedDays = [
                PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, new Date('0251-01-02'), '0251-01-02'),
                PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, new Date('0251-01-03'), '0251-01-03'),
            ];

            await Promise.all(plannedDays);
        });

        afterAll(async () => {
            await TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE);
        });

        test('incomplete day', async () => {
            const body: GetDailyHistoryRequest = {
                start: new Date('0251-01-01'),
                end: new Date('0251-01-05'),
            };

            const response = await request(app)
                .get(`/user/${ACCOUNT_USER_WITH_USER_ROLE.user.id}/daily-history`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .query(body)
                .send();

            const responseBody: GetDailyHistoryResponse = response.body;
            expect(responseBody.httpCode).toEqual(SUCCESS.httpCode);
            expect(responseBody.dailyHistory?.history.length).toEqual(5);
            expect(responseBody.dailyHistory?.history.filter((h) => !h.complete).length).toEqual(5);
        });
    });

    describe('valid case', () => {
        const TEST_EXISTING_TASK_TITLE = 'dhs test task 2';
        let TEST_EXISTING_TASK_ID: number;

        beforeAll(async () => {
            await TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE);

            const task = await TaskController.create(TEST_EXISTING_TASK_TITLE);
            TEST_EXISTING_TASK_ID = task!.id;

            const plannedDays = [
                PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, new Date('0250-01-02'), '0250-01-02'),
                PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, new Date('0250-01-03'), '0250-01-03'),
            ];

            const [plannedDay, plannedDay2] = await Promise.all(plannedDays);

            const taskGenerations = [
                PlannedTaskController.create(plannedDay, task!),
                PlannedTaskController.create(plannedDay, task!),
                PlannedTaskController.create(plannedDay2, task!),
                PlannedTaskController.create(plannedDay2, task!),
                PlannedTaskController.create(plannedDay2, task!),
            ];
            const [createdTask1, createdTask2, createdTask3, createdTask4, createdTask5] = await Promise.all(taskGenerations);

            const taskUpdates = [
                PlannedTaskController.update({ id: createdTask1!.id, status: 'COMPLETE' }),
                PlannedTaskController.update({ id: createdTask2!.id, status: 'COMPLETE' }),
            ];
            await Promise.all(taskUpdates);
        });

        afterAll(async () => {
            await TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE);
        });

        test('valid', async () => {
            const body: GetDailyHistoryRequest = {
                start: new Date('0250-01-01'),
                end: new Date('0250-01-05'),
            };

            const response = await request(app)
                .get(`/user/${ACCOUNT_USER_WITH_USER_ROLE.user.id}/daily-history`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .query(body)
                .send();

            const responseBody: GetDailyHistoryResponse = response.body;
            expect(responseBody.httpCode).toEqual(SUCCESS.httpCode);
            expect(responseBody.dailyHistory?.history.length).toEqual(5);
            expect(responseBody.dailyHistory?.history.filter((h) => h.complete).length).toEqual(1);
            expect(responseBody.dailyHistory?.history.filter((h) => !h.complete).length).toEqual(4);
        });
    });
});
