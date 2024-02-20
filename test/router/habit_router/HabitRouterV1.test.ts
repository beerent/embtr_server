import app from '@src/app';
import {
    CreateScheduledHabitRequest,
    CreateScheduledHabitResponse,
    GetScheduledHabitResponse,
    GetScheduledHabitsResponse,
} from '@resources/types/requests/ScheduledHabitTypes';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { TaskDao } from '@src/database/TaskDao';
import { TestUtility } from '@test/test_utility/TestUtility';
import { Task } from '@resources/schema';
import request from 'supertest';
import { ScheduledHabitDao } from '@src/database/ScheduledHabitDao';

describe('HabitServiceV1', () => {
    let user: any;
    let USER_TOKEN: string;
    let TASK: any;
    let scheduledHabit: any;

    const email = 'habit_router_v1_test@embtr.com';
    const password = 'password';
    const taskTitle = 'hrv1_test_task';

    beforeAll(async () => {
        user = await TestUtility.getUser(email, password);
        USER_TOKEN = await AuthenticationDao.generateValidIdToken(email, password);

        const task: Task = {
            title: taskTitle,
            description: 'description',
            remoteImageUrl: '',
            localImage: '',
        };

        TASK = await TaskDao.create(user.id, task);
    });

    afterAll(async () => {
        await TaskDao.deleteByTitle(taskTitle);
    });

    test('get one', async () => {
        scheduledHabit = await ScheduledHabitDao.create(user.id, TASK.id);

        const response = await request(app)
            .get(`/habit/schedule/${scheduledHabit.id}`)
            .set('client-version', '1.0.14')
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send();
        const responseBody: GetScheduledHabitResponse = response.body;

        expect(response.status).toEqual(200);
        expect(responseBody.scheduledHabit!.id).toBeDefined();

        // verify response does not have time of day id
        expect(responseBody.scheduledHabit!.timesOfDay).toBeUndefined();

        // verify database in good state
        const createdScheduledHabit = await ScheduledHabitDao.get(responseBody.scheduledHabit!.id!);
        expect(createdScheduledHabit?.timesOfDay[0].id).toEqual(5);
    });

    test('get all', async () => {
        scheduledHabit = await ScheduledHabitDao.create(user.id, TASK.id);

        const response = await request(app)
            .get(`/habit/${TASK.id}/schedules/`)
            .set('client-version', '1.0.14')
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send();
        const responseBody: GetScheduledHabitsResponse = response.body;

        expect(response.status).toEqual(200);
        expect(responseBody.scheduledHabits![0].timesOfDay).toBeUndefined();

        // verify database in good state
        const createdScheduledHabit = await ScheduledHabitDao.get(
            responseBody.scheduledHabits![0].id!
        );
        expect(createdScheduledHabit?.timesOfDay[0].id).toEqual(5);
    });

    test('create', async () => {
        const createRequest: CreateScheduledHabitRequest = {
            scheduledHabit: {
                taskId: TASK.id,
                title: 'title',
                description: 'description',
            },
        };

        const response = await request(app)
            .post('/habit/schedule/')
            .set('client-version', '1.0.14')
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send(createRequest);
        const responseBody: CreateScheduledHabitResponse = response.body;

        expect(response.status).toEqual(200);
        expect(responseBody.scheduledHabit!.id).toBeDefined();

        // verify response does not have time of day id
        expect(responseBody.scheduledHabit!.timesOfDay).toBeUndefined();

        // verify database in good state
        const createdScheduledHabit = await ScheduledHabitDao.get(responseBody.scheduledHabit!.id!);
        expect(createdScheduledHabit?.timesOfDay[0].id).toEqual(5);
    });
});
