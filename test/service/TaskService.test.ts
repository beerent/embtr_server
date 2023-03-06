import { TASK } from '@resources/endpoints';
import { CreateTaskRequest } from '@resources/types';
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
import { RO_NO_ROLE_TEST_USER_EMAIL, RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD } from '@test/util/DedicatedTestUsers';
import request from 'supertest';

describe('TaskService tests', () => {
    describe('get task', () => {
        test('get task with unauthenticated account', async () => {
            const response = await request(app).get(`${TASK}1`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown task with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${TASK}99999999`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get known task with insufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${TASK}1`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get invalid task with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${TASK}hello`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_TASK_FAILED_NOT_FOUND.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get unknown task with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${TASK}99999999`).set('Authorization', `Bearer ${requesterToken}`).send();

            expect(response.status).toEqual(GET_TASK_FAILED_NOT_FOUND.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('get known task with sufficient permissions', async () => {
            const requesterToken = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${TASK}1`).set('Authorization', `Bearer ${requesterToken}`).send();

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
            const token = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);

            const body = {};
            const response = await request(app).post(`${TASK}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.task).toBeUndefined();
        });

        test('create task that already exists with sufficient permissions', async () => {
            const token = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const body: CreateTaskRequest = { title: 'Test Task 1', description: 'Test Task Description' };

            const response = await request(app).post(`${TASK}`).set('Authorization', `Bearer ${token}`).send(body);
            expect(response.status).toEqual(CREATE_TASK_FAILED_ALREADY_EXISTS.httpCode);
        });

        describe('create task with cleanup', () => {
            const title = 'test task title';

            beforeAll(async () => {
                await TaskController.deleteByTitle(title);
            });

            test('create task with sufficient permissions', async () => {
                const token = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
                const body: CreateTaskRequest = { title: title, description: 'Test Task Description' };

                const response = await request(app).post(`${TASK}`).set('Authorization', `Bearer ${token}`).send(body);
                expect(response.status).toEqual(CREATE_TASK_SUCCESS.httpCode);
            });
        });
    });

    describe('search tasks', () => {
        test('unauthenticated', async () => {
            const response = await request(app).get(`${TASK}`).set('Authorization', `Bearer unauthorized`).send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const token = await AuthenticationController.generateValidIdToken(RO_NO_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${TASK}`).set('Authorization', `Bearer ${token}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const token = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
            const response = await request(app).get(`${TASK}`).query({}).set('Authorization', `Bearer ${token}`).send();

            expect(response.status).toEqual(SEARCH_TASKS_FAILED.httpCode);
            expect(response.body.tasks).toEqual([]);
        });

        describe('succes cases', () => {
            beforeAll(async () => {
                await TaskController.deleteByTitle('test task 01a');
                await TaskController.deleteByTitle('test task 01b');
                await TaskController.deleteByTitle('test task invalid');
                await TaskController.create('test task 01a', 'test task description');
                await TaskController.create('test task 01b', 'test task description');
                await TaskController.create('test task invalid', 'test task description');
            });

            test('search by title', async () => {
                const token = await AuthenticationController.generateValidIdToken(RO_USER_ROLE_TEST_USER_EMAIL, TEST_USER_PASSWORD);
                const response = await request(app).get(`${TASK}`).query({ q: 'test task 01' }).set('Authorization', `Bearer ${token}`).send();

                expect(response.status).toEqual(SEARCH_TASKS_SUCCESS.httpCode);
                expect(response.body.tasks.length).toEqual(2);
            });
        });
    });
});
