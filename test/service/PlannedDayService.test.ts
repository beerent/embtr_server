import { PLANNED_DAY } from '@resources/endpoints';
import {
    CreatePlannedDayRequest,
    CreatePlannedDayResponse,
    GetPlannedDayResponse,
} from '@resources/types/requests/PlannedDayTypes';
import {
    CreatePlannedTaskRequest,
    UpdatePlannedTaskRequest,
    UpdatePlannedTaskResponse,
} from '@resources/types/requests/PlannedTaskTypes';
import app from '@src/app';
import {
    CREATE_PLANNED_DAY_FAILED,
    CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS,
    CREATE_PLANNED_TASK_FAILED,
    CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY,
    CREATE_PLANNED_TASK_UNKNOWN_TASK,
    FORBIDDEN,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    GET_PLANNED_DAY_SUCCESS,
    SUCCESS,
    UNAUTHORIZED,
    UPDATE_PLANNED_TASK_FAILED,
} from '@src/common/RequestResponses';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { TaskController } from '@src/controller/TaskController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('planned day service', () => {
    const ACCOUNT_WITH_NO_ROLES = 'pds_account_no_roles@embtr.com';
    let USER_ACCOUNT_WITH_NO_ROLES: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE = 'pds_account_user_role@embtr.com';
    let USER_ACCOUNT_WITH_USER_ROLE: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE_2 = 'pds_account_user_role_2@embtr.com';
    let USER_ACCOUNT_WITH_USER_ROLE_2: TestAccountWithUser;

    const TEST_EXISTING_TASK_TITLE = 'test task';
    let TEST_EXISTING_TASK_ID: number;
    const TEST_EXISTING_TASK_TITLE_2 = 'test task 2';
    let TEST_EXISTING_TASK_ID_2: number;
    const TEST_EXISTING_TASK_TITLE_3 = 'test task 3';
    let TEST_EXISTING_TASK_ID_3: number;

    const TEST_EXISTING_PLANNED_DAY_KEY = '1001-01-01';
    const TEST_EXISTING_PLANNED_DAY_DATE = new Date(TEST_EXISTING_PLANNED_DAY_KEY);
    let TEST_EXISTING_PLANNED_DAY_ID: number;

    let TEST_EXISTING_PLANNED_TASK_TO_UPDATE_ID: number;
    let TEST_EXISTING_PLANNED_TASK_TO_UPDATE_ID_2: number;
    const TEST_EXISTING_PLANNED_TASK_TO_UPDATE_2_INITIAL_STATUS = 'initial status';
    let TEST_EXISTING_INACTIVE_PLANNED_TASK_ID: number;

    const TEST_PLANNED_DAY_KEY_TO_CREATE = '1001-01-02';

    beforeAll(async () => {
        const userAccountDeletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2),
            TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE),
            TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE_2),
            TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE_3),
        ];
        await Promise.all(userAccountDeletes);

        const userAccountCreates = [
            TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE_2, 'password', Role.USER),
        ];
        const [c1, c2, c3] = await Promise.all(userAccountCreates);
        USER_ACCOUNT_WITH_NO_ROLES = c1;
        USER_ACCOUNT_WITH_USER_ROLE = c2;
        USER_ACCOUNT_WITH_USER_ROLE_2 = c3;

        const taskCreates = [
            TaskController.create(TEST_EXISTING_TASK_TITLE),
            TaskController.create(TEST_EXISTING_TASK_TITLE + '2'),
            TaskController.create(TEST_EXISTING_TASK_TITLE + '3'),
            TaskController.create(TEST_EXISTING_TASK_TITLE + '4'),
            TaskController.create(TEST_EXISTING_TASK_TITLE_2),
            TaskController.create(TEST_EXISTING_TASK_TITLE_3),
        ];
        const [task, task2, task3, task4, task5, task6] = await Promise.all(taskCreates);
        TEST_EXISTING_TASK_ID = task!.id;
        TEST_EXISTING_TASK_ID_2 = task5!.id;
        TEST_EXISTING_TASK_ID_3 = task6!.id;

        const plannedDay = await PlannedDayController.create(
            USER_ACCOUNT_WITH_USER_ROLE.user.id,
            TEST_EXISTING_PLANNED_DAY_DATE,
            TEST_EXISTING_PLANNED_DAY_KEY
        );
        TEST_EXISTING_PLANNED_DAY_ID = plannedDay.id;

        const taskGenerations = [
            PlannedTaskController.create(plannedDay, task!),
            PlannedTaskController.create(plannedDay, task2!),
            PlannedTaskController.create(plannedDay, task3!),
            PlannedTaskController.create(plannedDay, task4!),
        ];
        const [_, createdTask2, createdTask3, inactiveTask] = await Promise.all(taskGenerations);
        TEST_EXISTING_PLANNED_TASK_TO_UPDATE_ID = createdTask2!.id;
        TEST_EXISTING_PLANNED_TASK_TO_UPDATE_ID_2 = createdTask3!.id;
        TEST_EXISTING_INACTIVE_PLANNED_TASK_ID = inactiveTask!.id;

        const taskUpdates = [
            PlannedTaskController.update({
                id: TEST_EXISTING_PLANNED_TASK_TO_UPDATE_ID_2,
                status: TEST_EXISTING_PLANNED_TASK_TO_UPDATE_2_INITIAL_STATUS,
            }),
            PlannedTaskController.update({
                id: TEST_EXISTING_INACTIVE_PLANNED_TASK_ID,
            }),
        ];
        await Promise.all(taskUpdates);
    });

    afterAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2),
            TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE),
            TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE + '2'),
            TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE + '3'),
            TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE + '4'),
            TaskController.deleteByTitle(TEST_EXISTING_TASK_TITLE_2),
        ];

        await Promise.all(deletes);
    });

    describe('get planned day by id', () => {
        test('get planned day with unauthenticated account', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}1`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown plannedDay with insufficient permissions', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}0`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get known plannedDay with insufficient permissions', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}${TEST_EXISTING_PLANNED_DAY_ID}`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get invalid plannedDay with sufficient permissions', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}hello`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get unknown plannedDay with sufficient permissions', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}99999999`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get known plannedDay with sufficient permissions', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}${TEST_EXISTING_PLANNED_DAY_ID}`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_SUCCESS.httpCode);
            expect(response.body.plannedDay).toBeDefined();
        });

        test('returns plannedTasks with plannedDay', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}${TEST_EXISTING_PLANNED_DAY_ID}`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            const responseBody: GetPlannedDayResponse = response.body;

            expect(response.status).toEqual(GET_PLANNED_DAY_SUCCESS.httpCode);
            expect(responseBody.plannedDay!.plannedTasks!.length).toBeGreaterThan(0);
        });
    });

    describe('get planned day by user', () => {
        test('get planned day with unauthenticated account', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}${USER_ACCOUNT_WITH_USER_ROLE.user.uid}/1`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown plannedDay with insufficient permissions', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}${USER_ACCOUNT_WITH_USER_ROLE.user.id}/1001-12-25`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get known plannedDay with insufficient permissions', async () => {
            const response = await request(app)
                .get(
                    `${PLANNED_DAY}${USER_ACCOUNT_WITH_USER_ROLE.user.id}/${TEST_EXISTING_PLANNED_DAY_KEY}`
                )
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get invalid plannedDay with sufficient permissions', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}${USER_ACCOUNT_WITH_USER_ROLE.user.id}/blah`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get unknown plannedDay with sufficient permissions', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY}${USER_ACCOUNT_WITH_USER_ROLE.user.id}/1001-12-25`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_FAILED_NOT_FOUND.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('get known plannedDay with sufficient permissions', async () => {
            const response = await request(app)
                .get(
                    `${PLANNED_DAY}${USER_ACCOUNT_WITH_USER_ROLE.user.id}/${TEST_EXISTING_PLANNED_DAY_KEY}`
                )
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_PLANNED_DAY_SUCCESS.httpCode);
            expect(response.body.plannedDay).toBeDefined();
        });

        test('returns plannedTasks with plannedDay', async () => {
            const response = await request(app)
                .get(
                    `${PLANNED_DAY}${USER_ACCOUNT_WITH_USER_ROLE.user.id}/${TEST_EXISTING_PLANNED_DAY_KEY}`
                )
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            const responseBody: GetPlannedDayResponse = response.body;

            expect(response.status).toEqual(GET_PLANNED_DAY_SUCCESS.httpCode);
            expect(responseBody.plannedDay!.plannedTasks!.length).toBeGreaterThan(0);
        });
    });

    describe('create planned day', () => {
        test('create planned day with unauthenticated account', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY}`)
                .set('Authorization', 'Bearer Trash')
                .send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('create planned day with insuffecient permissions', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY}`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('create planned day invalid', async () => {
            const body: CreatePlannedDayRequest = {
                dayKey: '',
            };

            const response = await request(app)
                .post(`${PLANNED_DAY}`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(CREATE_PLANNED_DAY_FAILED.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('already exists', async () => {
            const body: CreatePlannedDayRequest = {
                dayKey: TEST_EXISTING_PLANNED_DAY_KEY,
            };

            const response = await request(app)
                .post(`${PLANNED_DAY}`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS.httpCode);
            expect(response.body).toEqual(CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS);
        });

        test('success case', async () => {
            const body: CreatePlannedDayRequest = {
                dayKey: TEST_PLANNED_DAY_KEY_TO_CREATE,
            };

            const response = await request(app)
                .post(`${PLANNED_DAY}`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);
            const responseObject: CreatePlannedDayResponse = response.body;

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(responseObject.success).toBeTruthy();
            expect(responseObject.plannedDay?.dayKey).toEqual(TEST_PLANNED_DAY_KEY_TO_CREATE);
        });
    });

    describe('create planned task', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', 'Bearer Trash')
                .send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.plannedTask).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedTask).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send({});

            expect(response.status).toEqual(CREATE_PLANNED_TASK_FAILED.httpCode);
            expect(response.body).toEqual(CREATE_PLANNED_TASK_FAILED);
        });

        test('unknown task', async () => {
            const body: CreatePlannedTaskRequest = {
                plannedDayId: TEST_EXISTING_PLANNED_DAY_ID,
                taskId: 0,
            };

            const response = await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(CREATE_PLANNED_TASK_UNKNOWN_TASK.httpCode);
            expect(response.body).toEqual(CREATE_PLANNED_TASK_UNKNOWN_TASK);
        });

        test('unknown plannedDay', async () => {
            const body: CreatePlannedTaskRequest = {
                plannedDayId: 0,
                taskId: TEST_EXISTING_TASK_ID,
            };

            const response = await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY.httpCode);
            expect(response.body).toEqual(CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY);
        });

        test('plannedDay belongs to different user', async () => {
            const body: CreatePlannedTaskRequest = {
                plannedDayId: TEST_EXISTING_PLANNED_DAY_ID,
                taskId: 0,
            };

            const response = await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE_2.token}`)
                .send(body);

            expect(response.status).toEqual(CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY.httpCode);
            expect(response.body).toEqual(CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY);
        });

        test('success case', async () => {
            const body: CreatePlannedTaskRequest = {
                plannedDayId: TEST_EXISTING_PLANNED_DAY_ID,
                taskId: TEST_EXISTING_TASK_ID_2,
            };

            const response = await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
        });

        test('create multiple results in incrementing count on same planned task', async () => {
            const body: CreatePlannedTaskRequest = {
                plannedDayId: TEST_EXISTING_PLANNED_DAY_ID,
                taskId: TEST_EXISTING_TASK_ID_3,
            };

            await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);
            await request(app)
                .post(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            const plannedTask = await PlannedTaskController.getByPlannedDayIdAndTaskId(
                TEST_EXISTING_PLANNED_DAY_ID,
                TEST_EXISTING_TASK_ID_3
            );
            expect(plannedTask?.count).toEqual(2);
        });
    });

    describe('complete planned task', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .patch(`${PLANNED_DAY}planned-task`)
                .set('Authorization', 'Bearer Trash')
                .send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .patch(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.plannedDay).toBeUndefined();
        });

        test('invalid', async () => {
            const body: UpdatePlannedTaskRequest = {
                plannedTask: {},
            };
            const response = await request(app)
                .patch(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(UPDATE_PLANNED_TASK_FAILED.httpCode);
            expect(response.body).toEqual(UPDATE_PLANNED_TASK_FAILED);
        });

        test('does not exist', async () => {
            const body: UpdatePlannedTaskRequest = {
                plannedTask: {
                    id: 0,
                },
            };

            const response = await request(app)
                .patch(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(UPDATE_PLANNED_TASK_FAILED.httpCode);
            expect(response.body).toEqual(UPDATE_PLANNED_TASK_FAILED);
        });

        test('can update status', async () => {
            const body: UpdatePlannedTaskRequest = {
                plannedTask: {
                    id: TEST_EXISTING_PLANNED_TASK_TO_UPDATE_ID,
                    status: 'updated_status',
                },
            };

            const response = await request(app)
                .patch(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);

            const updateResponse: UpdatePlannedTaskResponse = response.body;
            expect(updateResponse.plannedTask?.status).toEqual('updated_status');
        });

        test('does not changed untouched fields', async () => {
            const body: UpdatePlannedTaskRequest = {
                plannedTask: {
                    id: TEST_EXISTING_PLANNED_TASK_TO_UPDATE_ID_2,
                },
            };

            const response = await request(app)
                .patch(`${PLANNED_DAY}planned-task`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);

            const updateResponse: UpdatePlannedTaskResponse = response.body;
            expect(updateResponse.plannedTask?.status).toEqual(
                TEST_EXISTING_PLANNED_TASK_TO_UPDATE_2_INITIAL_STATUS
            );
        });
    });
});
