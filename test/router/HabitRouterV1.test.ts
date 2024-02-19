import {
    CreateScheduledHabitRequest,
    CreateScheduledHabitResponse,
    GetScheduledHabitResponse,
    GetScheduledHabitsResponse,
} from '@resources/types/requests/ScheduledHabitTypes';
import app from '@src/app';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { TaskDao } from '@src/database/TaskDao';
import { Role } from '@src/roles/Roles';
import { AccountService } from '@src/service/AccountService';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import { Task } from '@resources/schema';
import request from 'supertest';
import { ScheduledHabitDao } from '@src/database/ScheduledHabitDao';

describe('HabitServiceV1', () => {
    let USER: TestAccountWithUser;
    let USER_TOKEN: string;
    let TASK: any;

    beforeAll(async () => {
        USER = await TestUtility.createAccountWithUser(
            'habit_router_v1@embtr.com',
            'password',
            Role.USER
        );
        await AccountService.manuallyVerifyEmail('habit_router_v1@embtr.com');
        USER_TOKEN = await AuthenticationDao.generateValidIdToken(
            'habit_router_v1@embtr.com',
            'password'
        );

        const task: Task = {
            title: 'testTitle',
            description: 'description',
            remoteImageUrl: '',
            localImage: '',
        };

        TASK = await TaskDao.create(USER.user.id, task);
    });

    afterAll(async () => {
        await TestUtility.deleteAccountWithUser('habit_router_v1@embtr.com');
        await TaskDao.deleteByTitle('testTitle');
    });

    describe('GET', () => {
        let scheduledHabit: any;

        afterAll(async () => {
            ScheduledHabitDao.delete(scheduledHabit.id);
        });

        test('get one', async () => {
            scheduledHabit = await ScheduledHabitDao.create(USER.user.id, TASK.id);

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
            const createdScheduledHabit = await ScheduledHabitDao.get(
                responseBody.scheduledHabit!.id!
            );
            expect(createdScheduledHabit?.timesOfDay[0].id).toEqual(5);
        });

        test('get all', async () => {
            scheduledHabit = await ScheduledHabitDao.create(USER.user.id, TASK.id);

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
    });

    describe('POST', () => {
        test('transformation', async () => {
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
            const createdScheduledHabit = await ScheduledHabitDao.get(
                responseBody.scheduledHabit!.id!
            );
            expect(createdScheduledHabit?.timesOfDay[0].id).toEqual(5);
        });
    });
});
