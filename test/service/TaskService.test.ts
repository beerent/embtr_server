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
    UNAUTHORIZED,
} from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { TaskController } from '@src/controller/TaskController';
import request from 'supertest';
import { TestUtility } from '@test/test_utility/TestUtility';
import { Role } from '@src/roles/Roles';
import { CreateTaskRequest } from '@resources/types/TaskTypes';

describe('TaskService tests', () => {
    const ACCOUNT_WITH_NO_ROLES = 'ts_account_no_roles@embtr.com';

    const ACCOUNT_WITH_USER_ROLE = 'ts_account_user_role@embtr.com';

    const TEST_TASK_TITLE = 'ts_test_task';
    let TEST_TASK_ID: number;

    const TEST_TASK_TO_CREATE = 'ts_test_task_to_create';

    const TEST_TASK_SEARCH_PREFIX = 'task_service_test_';
    const TEST_TASK_SEARCH_TITLE_1 = `${TEST_TASK_SEARCH_PREFIX}test task 01a`;
    const TEST_TASK_SEARCH_TITLE_2 = `${TEST_TASK_SEARCH_PREFIX}test task 01b`;
    const TEST_TASK_SEARCH_TITLE_3 = `${TEST_TASK_SEARCH_PREFIX}test task invalid`;

    beforeAll(async () => {
        // create test accounts
        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES);
        await TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID);

        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE);
        await TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER);

        // create test tasks
        await TaskController.deleteAllLikeTitle(TEST_TASK_SEARCH_PREFIX);
        await TaskController.deleteAllLikeTitle('ts_test_');

        const task = await TaskController.create(TEST_TASK_TITLE);
        TEST_TASK_ID = task!.id;

        await TaskController.create(TEST_TASK_SEARCH_TITLE_1);
        await TaskController.create(TEST_TASK_SEARCH_TITLE_2);
        await TaskController.create(TEST_TASK_SEARCH_TITLE_3);
    });

    afterAll(async () => {
        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES);
        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE);
        await TaskController.deleteAllLikeTitle(TEST_TASK_SEARCH_PREFIX);
        await TaskController.deleteAllLikeTitle('ts_test_');
    });

    describe('get task', () => {
        test('get task with unauthenticated account', async () => {
            const response = await request(app).get(`${TASK}1`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown task with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const response = await request(app).get(`${TASK}99999999`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get known task with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const response = await request(app).get(`${TASK}1`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get invalid task with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const response = await request(app).get(`${TASK}hello`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_TASK_FAILED_NOT_FOUND.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown task with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const response = await request(app).get(`${TASK}99999999`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_TASK_FAILED_NOT_FOUND.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get known task with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const response = await request(app).get(`${TASK}${TEST_TASK_ID}`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_TASK_SUCCESS.httpCode);
            expect(response.body.task).toBeDefined();
        });
    });

    describe('create task', () => {
        test('create task with unauthenticated account', async () => {
            const body = {};
            const response = await request(app).post(`${TASK}`).set('Authorization', 'Bearer Trash').send(body);

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('create task with insufficient permissions', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');

            const body = {};
            const response = await request(app).post(`${TASK}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('create task that already exists with sufficient permissions', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const body: CreateTaskRequest = { title: TEST_TASK_TITLE, description: 'Test Task Description' };

            const response = await request(app).post(`${TASK}`).set('Authorization', `Bearer ${token}`).send(body);
            expect(response.status).toEqual(CREATE_TASK_FAILED_ALREADY_EXISTS.httpCode);
        });

        test('create task with sufficient permissions', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const body: CreateTaskRequest = { title: TEST_TASK_TO_CREATE, description: 'Test Task Description' };

            const response = await request(app).post(`${TASK}`).set('Authorization', `Bearer ${token}`).send(body);
            expect(response.status).toEqual(CREATE_TASK_SUCCESS.httpCode);
        });
    });

    describe('search tasks', () => {
        test('unauthenticated', async () => {
            const response = await request(app).get(`${TASK}`).set('Authorization', `Bearer unauthorized`).send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password');
            const response = await request(app).get(`${TASK}`).set('Authorization', `Bearer ${token}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const response = await request(app).get(`${TASK}`).query({}).set('Authorization', `Bearer ${token}`).send();

            expect(response.status).toEqual(SEARCH_TASKS_FAILED.httpCode);
            expect(response.body.tasks).toEqual([]);
        });

        test('search by title', async () => {
            const token = await AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password');
            const response = await request(app)
                .get(`${TASK}`)
                .query({ q: `${TEST_TASK_SEARCH_PREFIX}test task 01` })
                .set('Authorization', `Bearer ${token}`)
                .send();

            expect(response.status).toEqual(SEARCH_TASKS_SUCCESS.httpCode);
            expect(response.body.tasks.length).toEqual(2);
        });
    });
});
