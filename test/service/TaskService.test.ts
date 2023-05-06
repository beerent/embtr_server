import { TASK } from '@resources/endpoints';
import app from '@src/app';
import {
    CREATE_TASK_FAILED_ALREADY_EXISTS,
    CREATE_TASK_SUCCESS,
    FORBIDDEN,
    GET_TASK_FAILED_NOT_FOUND,
    GET_TASK_SUCCESS,
    SEARCH_TASKS_FAILED,
    SEARCH_TASKS_SUCCESS,
    SUCCESS,
    UNAUTHORIZED,
} from '@src/common/RequestResponses';
import { TaskController } from '@src/controller/TaskController';
import request from 'supertest';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import { Role } from '@src/roles/Roles';
import { CreateTaskRequest, CreateTaskResponse } from '@resources/types/requests/TaskTypes';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { PlannedDayService } from '@src/service/PlannedDayService';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';
import { Task } from '@prisma/client';

describe('TaskService tests', () => {
    let USER_WITHOUT_ROLE: TestAccountWithUser;
    let USER_WITH_ROLE: TestAccountWithUser;

    const TEST_TASK_TITLE = 'ts_test_task';
    let TEST_TASK_ID: number;

    const TEST_TASK_TO_CREATE = 'ts_test_task_to_create';

    const TEST_TASK_SEARCH_PREFIX = 'task_service_test_';
    const TEST_TASK_SEARCH_TITLE_1 = `${TEST_TASK_SEARCH_PREFIX}test task 01a`;
    const TEST_TASK_SEARCH_TITLE_2 = `${TEST_TASK_SEARCH_PREFIX}test task 01b`;
    const TEST_TASK_SEARCH_TITLE_3 = `${TEST_TASK_SEARCH_PREFIX}test task invalid`;
    let TASK1: Task;
    let TASK2: Task;
    let TASK3: Task;

    beforeAll(async () => {
        // create test accounts
        const userDeletes = [
            TestUtility.deleteAccountWithUser('ts_no_role@embtr.com'),
            TestUtility.deleteAccountWithUser('ts_user_role@embtr.com'),
        ];
        await Promise.all(userDeletes);

        const creates = [
            TestUtility.createAccountWithUser('ts_no_role@embtr.com', 'password', Role.INVALID),
            TestUtility.createAccountWithUser('ts_user_role@embtr.com', 'password', Role.USER),
        ];
        const [u1, u2] = await Promise.all(creates);
        USER_WITHOUT_ROLE = u1;
        USER_WITH_ROLE = u2;

        // create test tasks
        const taskDeletes = [
            TaskController.deleteAllLikeTitle(TEST_TASK_SEARCH_PREFIX),
            TaskController.deleteAllLikeTitle('ts_test_'),
        ];
        await Promise.all(taskDeletes);

        const task = await TaskController.create(TEST_TASK_TITLE);
        TEST_TASK_ID = task!.id;

        const taskSearches = [
            TaskController.create(TEST_TASK_SEARCH_TITLE_1),
            TaskController.create(TEST_TASK_SEARCH_TITLE_2),
            TaskController.create(TEST_TASK_SEARCH_TITLE_3),
        ];
        const [task1, task2, task3] = await Promise.all(taskSearches);
        TASK1 = task1!;
        TASK2 = task2!;
        TASK3 = task3!;
    });

    afterAll(async () => {
        await TestUtility.deleteAccountWithUser('ts_no_role@embtr.com');
        await TestUtility.deleteAccountWithUser('ts_user_role@embtr.com');
        await TaskController.deleteAllLikeTitle(TEST_TASK_SEARCH_PREFIX);
        await TaskController.deleteAllLikeTitle('ts_test_');
    });

    describe('get task', () => {
        test('get task with unauthenticated account', async () => {
            const response = await request(app)
                .get(`${TASK}1`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown task with insufficient permissions', async () => {
            const response = await request(app)
                .get(`${TASK}99999999`)
                .set('Authorization', `Bearer ${USER_WITHOUT_ROLE.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get known task with insufficient permissions', async () => {
            const response = await request(app)
                .get(`${TASK}1`)
                .set('Authorization', `Bearer ${USER_WITHOUT_ROLE.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get invalid task with sufficient permissions', async () => {
            const response = await request(app)
                .get(`${TASK}hello`)
                .set('Authorization', `Bearer ${USER_WITH_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_TASK_FAILED_NOT_FOUND.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown task with sufficient permissions', async () => {
            const response = await request(app)
                .get(`${TASK}99999999`)
                .set('Authorization', `Bearer ${USER_WITH_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_TASK_FAILED_NOT_FOUND.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get known task with sufficient permissions', async () => {
            const response = await request(app)
                .get(`${TASK}${TEST_TASK_ID}`)
                .set('Authorization', `Bearer ${USER_WITH_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GET_TASK_SUCCESS.httpCode);
            expect(response.body.task).toBeDefined();
        });
    });

    describe('create task', () => {
        test('create task with unauthenticated account', async () => {
            const body = {};
            const response = await request(app)
                .post(`${TASK}`)
                .set('Authorization', 'Bearer Trash')
                .send(body);

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('create task with insufficient permissions', async () => {
            const body = {};
            const response = await request(app)
                .post(`${TASK}`)
                .set('Authorization', `Bearer ${USER_WITHOUT_ROLE.token}`)
                .send(body);

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('create task that already exists with sufficient permissions', async () => {
            const body: CreateTaskRequest = {
                title: TEST_TASK_TITLE,
                description: 'Test Task Description',
            };

            const response = await request(app)
                .post(`${TASK}`)
                .set('Authorization', `Bearer ${USER_WITH_ROLE.token}`)
                .send(body);
            expect(response.status).toEqual(CREATE_TASK_FAILED_ALREADY_EXISTS.httpCode);
        });

        test('create task with sufficient permissions', async () => {
            const body: CreateTaskRequest = {
                title: TEST_TASK_TO_CREATE,
                description: 'Test Task Description',
            };

            const response = await request(app)
                .post(`${TASK}`)
                .set('Authorization', `Bearer ${USER_WITH_ROLE.token}`)
                .send(body);
            const createTaskResponse: CreateTaskResponse = response.body;

            expect(response.status).toEqual(CREATE_TASK_SUCCESS.httpCode);
            expect(createTaskResponse.task).toBeDefined();
        });
    });

    describe('search tasks', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get(`${TASK}`)
                .set('Authorization', `Bearer unauthorized`)
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get(`${TASK}`)
                .set('Authorization', `Bearer ${USER_WITHOUT_ROLE.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .get(`${TASK}`)
                .query({})
                .set('Authorization', `Bearer ${USER_WITH_ROLE.token}`)
                .send();

            expect(response.status).toEqual(SEARCH_TASKS_FAILED.httpCode);
            expect(response.body.tasks).toEqual([]);
        });

        test('search by title', async () => {
            const response = await request(app)
                .get(`${TASK}`)
                .query({ q: `${TEST_TASK_SEARCH_PREFIX}test task 01` })
                .set('Authorization', `Bearer ${USER_WITH_ROLE.token}`)
                .send();

            expect(response.status).toEqual(SEARCH_TASKS_SUCCESS.httpCode);
            expect(response.body.tasks.length).toEqual(2);
        });
    });

    describe('get recent', () => {
        beforeAll(async () => {
            const plannedDay = await PlannedDayController.create(
                USER_WITH_ROLE.user.id,
                new Date('1800-01-01'),
                '1800-01-01'
            );
            const creates = [
                PlannedTaskController.create(plannedDay, TASK1),
                PlannedTaskController.create(plannedDay, TASK3),
                PlannedTaskController.create(plannedDay, TASK2),
            ];
            await Promise.all(creates);
        });

        test('unauthenticated', async () => {
            const response = await request(app)
                .get('/task/recent')
                .set('Authorization', `Bearer unauthorized`)
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get('/task/recent')
                .set('Authorization', `Bearer ${USER_WITHOUT_ROLE.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('valid', async () => {
            const response = await request(app)
                .get('/task/recent')
                .set('Authorization', `Bearer ${USER_WITH_ROLE.token}`)
                .send();

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.tasks.length).toEqual(3);
        });
    });
});
