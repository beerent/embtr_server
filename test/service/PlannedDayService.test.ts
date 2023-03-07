import { PLANNED_DAY } from '@resources/endpoints';
import { CreatePlannedDayRequest, CreatePlannedTaskRequest } from '@resources/types';
import app from '@src/app';
import {
    CREATE_PLANNED_DAY_FAILED,
    CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS,
    CREATE_PLANNED_DAY_SUCCESS,
    CREATE_PLANNED_TASK_FAILED,
    CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY,
    CREATE_PLANNED_TASK_UNKNOWN_TASK,
    FORBIDDEN,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    GET_PLANNED_DAY_SUCCESS,
    SUCCESS,
    UNAUTHORIZED,
} from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { TaskController } from '@src/controller/TaskController';
import {
    RO_NO_ROLE_TEST_USER_EMAIL,
    RO_USER_ROLE_TEST_USER_EMAIL,
    RW_USER_ROLE_TEST_USER_EMAIL,
    RW_USER_ROLE_TEST_USER_ID,
    TEST_USER_PASSWORD,
} from '@test/util/DedicatedTestUsers';
import request from 'supertest';

const KNOWN_GOOD_PLANNED_DAY_ID = '29';
const KNOWN_GOOD_PLANNED_DAY_USER_ID = RW_USER_ROLE_TEST_USER_ID;
const KNOWN_GOOD_PLANNED_DAY_DAY_KEY = '1991-01-01';

describe('planned day service', () => {
    describe('get planned day by id', () => {
        test('get planned day with unauthenticated account', async () => {
            const response = await request(app).get(`${PLANNED_DAY}1`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown plannedDay with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${PLANNED_DAY}1`).set('Authorization', `Bearer ${requesterToken}`).send();

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

        test('get known plannedDay with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_ID}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_PLANNED_DAY_SUCCESS.httpCode);
            expect(response.body.plannedDay).toBeDefined();
        });
    });

    describe('get planned day by user', () => {
        test('get planned day with unauthenticated account', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_USER_ID}/${KNOWN_GOOD_PLANNED_DAY_DAY_KEY}`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown plannedDay with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app)
                .get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_USER_ID}/1001-12-25`)
                .set('Authorization', `Bearer ${requesterToken}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get known plannedDay with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app)
                .get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_USER_ID}/${KNOWN_GOOD_PLANNED_DAY_DAY_KEY}`)
                .set('Authorization', `Bearer ${requesterToken}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get invalid plannedDay with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app)
                .get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_USER_ID}/blah`)
                .set('Authorization', `Bearer ${requesterToken}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get unknown plannedDay with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app)
                .get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_USER_ID}/1001-12-25`)
                .set('Authorization', `Bearer ${requesterToken}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get known plannedDay with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app)
                .get(`${PLANNED_DAY}${KNOWN_GOOD_PLANNED_DAY_USER_ID}/${KNOWN_GOOD_PLANNED_DAY_DAY_KEY}`)
                .set('Authorization', `Bearer ${requesterToken}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_SUCCESS.httpCode);
            expect(response.body.plannedDay).toBeDefined();
        });
    });

    describe('create planned day', () => {
        test('create planned day with unauthenticated account', async () => {
            const response = await request(app).post(`${PLANNED_DAY}`).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('create planned day with insuffecient permissions', async () => {
            const token = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).post(`${PLANNED_DAY}`).set('Authorization', `Bearer ${token}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('create planned day invalid', async () => {
            const body: CreatePlannedDayRequest = {
                dayKey: '',
            };

            const token = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).post(`${PLANNED_DAY}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toEqual(CREATE_PLANNED_DAY_FAILED.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        describe('create planned day', () => {
            const userId = RW_USER_ROLE_TEST_USER_ID;
            const dateString = '2020-01-01';

            beforeAll(async () => {
                await PlannedDayController.deleteByUserAndDayKey(userId, dateString);
                await PlannedDayController.create(userId, new Date(dateString), dateString);
            });

            test('already exists', async () => {
                const token = await AuthenticationController.generateValidIdToken(RW_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: CreatePlannedDayRequest = {
                    dayKey: dateString,
                };

                const response = await request(app).post(`${PLANNED_DAY}`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS.httpCode);
                expect(response.body).toEqual(CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS);
            });
        });

        describe('create planned day', () => {
            const userId = RW_USER_ROLE_TEST_USER_ID;
            const dateString = '2020-01-01';

            beforeAll(async () => {
                await PlannedDayController.deleteByUserAndDayKey(userId, dateString);
            });

            test('success case', async () => {
                const token = await AuthenticationController.generateValidIdToken(RW_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: CreatePlannedDayRequest = {
                    dayKey: dateString,
                };

                const response = await request(app).post(`${PLANNED_DAY}`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(SUCCESS.httpCode);
                expect(response.body).toEqual(CREATE_PLANNED_DAY_SUCCESS);
            });
        });
    });

    describe('create planned task', () => {
        test('unauthenticated', async () => {
            const response = await request(app).post(`${PLANNED_DAY}planned-task`).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('unauthorized', async () => {
            const token = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).post(`${PLANNED_DAY}planned-task`).set('Authorization', `Bearer ${token}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('invalid', async () => {
            const token = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).post(`${PLANNED_DAY}planned-task`).set('Authorization', `Bearer ${token}`).send({});

            expect(response.status).toEqual(CREATE_PLANNED_TASK_FAILED.httpCode);
            expect(response.body).toEqual(CREATE_PLANNED_TASK_FAILED);
        });

        describe('missing dependencies', () => {
            const dayKey = '2020-01-01';
            let plannedDayId: number;

            beforeAll(async () => {
                await PlannedDayController.deleteByUserAndDayKey(RW_USER_ROLE_TEST_USER_ID, dayKey);
                plannedDayId = (await PlannedDayController.create(RW_USER_ROLE_TEST_USER_ID, new Date(dayKey), dayKey)).id;
            });

            test('unknown task', async () => {
                const token = await AuthenticationController.generateValidIdToken(RW_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: CreatePlannedTaskRequest = {
                    plannedDayId,
                    taskId: 0,
                };

                const response = await request(app).post(`${PLANNED_DAY}planned-task`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(CREATE_PLANNED_TASK_UNKNOWN_TASK.httpCode);
                expect(response.body).toEqual(CREATE_PLANNED_TASK_UNKNOWN_TASK);
            });
        });

        describe('missing dependencies', () => {
            const taskTitle = 'unknown plannedDay task name test';
            let taskId: number;

            beforeAll(async () => {
                await TaskController.deleteByTitle(taskTitle);
                taskId = (await TaskController.create(taskTitle))!.id;
            });

            test('unknown plannedDay', async () => {
                const token = await AuthenticationController.generateValidIdToken(RW_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: CreatePlannedTaskRequest = {
                    plannedDayId: 0,
                    taskId,
                };

                const response = await request(app).post(`${PLANNED_DAY}planned-task`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY.httpCode);
                expect(response.body).toEqual(CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY);
            });
        });

        describe('invalid dependencies', () => {
            const dayKey = '2020-01-01';
            let plannedDayId: number;

            beforeAll(async () => {
                await PlannedDayController.deleteByUserAndDayKey(RW_USER_ROLE_TEST_USER_ID, dayKey);
                plannedDayId = (await PlannedDayController.create(RW_USER_ROLE_TEST_USER_ID, new Date(dayKey), dayKey)).id;
            });

            test('plannedDay belongs to different user', async () => {
                const token = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: CreatePlannedTaskRequest = {
                    plannedDayId,
                    taskId: 0,
                };

                const response = await request(app).post(`${PLANNED_DAY}planned-task`).set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toEqual(CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY.httpCode);
                expect(response.body).toEqual(CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY);
            });
        });

        describe('success case', () => {
            const dayKey = '2020-01-01';
            const taskName = 'plannedDaySuccessCaseTaskName';
            let taskId: number;
            let plannedDayId: number;

            beforeAll(async () => {
                await PlannedDayController.deleteByUserAndDayKey(RW_USER_ROLE_TEST_USER_ID, dayKey);
                plannedDayId = (await PlannedDayController.create(RW_USER_ROLE_TEST_USER_ID, new Date(dayKey), dayKey)).id;

                await TaskController.deleteByTitle(taskName);
                taskId = (await TaskController.create(taskName))!.id;
            });

            afterAll(async () => {
                await PlannedTaskController.deleteByUserIdAndPlannedDayIdAndTaskId(RW_USER_ROLE_TEST_USER_ID, plannedDayId, taskId);
                await TaskController.deleteByTitle(taskName);
                await PlannedDayController.deleteByUserAndDayKey(RW_USER_ROLE_TEST_USER_ID, dayKey);
            });

            test('success case', async () => {
                const token = await AuthenticationController.generateValidIdToken(RW_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

                const body: CreatePlannedTaskRequest = {
                    plannedDayId,
                    taskId,
                };

                const response = await request(app).post(`${PLANNED_DAY}planned-task`).set('Authorization', `Bearer ${token}`).send(body);
                expect(response.status).toEqual(SUCCESS.httpCode);
            });
        });
    });
});
