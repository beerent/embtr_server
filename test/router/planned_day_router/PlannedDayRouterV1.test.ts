import { TestUtility } from '@test/test_utility/TestUtility';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import {
    CreatePlannedTaskRequest,
    CreatePlannedTaskResponse,
    UpdatePlannedTaskRequest,
    UpdatePlannedTaskResponse,
} from '@resources/types/requests/PlannedTaskTypes';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import request from 'supertest';
import app from '@src/app';
import { ScheduledHabitDao } from '@src/database/ScheduledHabitDao';
import { TaskDao } from '@src/database/TaskDao';
import { PlannedHabitDao } from '@src/database/PlannedHabitDao';
import { PlannedDay, PlannedTask } from '@resources/schema';
import { GetPlannedDayResponse } from '@resources/types/requests/PlannedDayTypes';

describe('PlannedDayRouterV1', () => {
    let user: any;
    let USER_TOKEN: string;

    let createdPlannedDay: any;
    let createdTask: any;
    let createdScheduledHabit: any;
    let createdPlannedTask: any;
    let plannedTaskToUpdate: any;
    let plannedTaskToRead: any;

    const version = '1.0.14';
    const email = 'pt_router_v1_test@embtr.com';
    const password = 'password';
    const dayKey = '2020-01-01';
    const taskTitle = 'pdrv1_test_task';

    beforeAll(async () => {
        user = await TestUtility.getUser(email, password);
        USER_TOKEN = await AuthenticationDao.generateValidIdToken(email, password);

        const exists = await PlannedDayDao.findByUserAndDayKey(user.id, dayKey);
        if (exists) {
            await PlannedDayDao.deleteByUserAndDayKey(user.id, dayKey);
        }

        createdPlannedDay = await PlannedDayDao.create(user.id, dayKey);
        createdTask = await TaskDao.create(user.id, {
            title: taskTitle,
            description: 'description',
            remoteImageUrl: '',
            localImage: '',
        });
        createdScheduledHabit = await ScheduledHabitDao.create(user.id, createdTask.id);

        // create planned task to update and read
        plannedTaskToUpdate = await PlannedHabitDao.create({
            plannedDayId: createdPlannedDay.id,
            scheduledHabitId: createdScheduledHabit.id,
            title: '',
            description: '',
            remoteImageUrl: '',
            localImage: '',
        });

        // create planned task to read
        plannedTaskToRead = await PlannedHabitDao.create({
            plannedDayId: createdPlannedDay.id,
            scheduledHabitId: createdScheduledHabit.id,
            title: '',
            description: '',
            remoteImageUrl: '',
            localImage: '',
        });
    });

    afterAll(async () => {
        await PlannedDayDao.deleteByUserAndDayKey(user.id, dayKey);
        await TaskDao.deleteByTitle(taskTitle);
    });

    test('create planned task', async () => {
        const createRequest: CreatePlannedTaskRequest = {
            plannedTask: {
                plannedDayId: createdPlannedDay.id,
                scheduledHabitId: createdScheduledHabit.id,
                title: '',
                description: '',
                remoteImageUrl: '',
                localImage: '',
            },
        };

        const url = `/planned-day/${createdPlannedDay.dayKey}/planned-task/`;

        const response = await request(app)
            .post(url)
            .set('client-version', version)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send(createRequest);
        const responseBody: CreatePlannedTaskResponse = response.body;
        createdPlannedTask = responseBody.plannedTask;

        expect(response.status).toEqual(200);

        // verify response does not have time of day id
        expect(createdPlannedTask.timeOfDayId).toBeUndefined();

        // verify database in good state
        const databasePlannedHabit = await PlannedHabitDao.get(createdPlannedTask.id);
        expect(databasePlannedHabit?.timeOfDayId).toEqual(5);
    });

    test('update planned task', async () => {
        const url = `/planned-day/planned-task/`;
        const updateTask: PlannedTask = {
            id: plannedTaskToUpdate.id,
            description: 'updated description',
        };

        const updateRequest: UpdatePlannedTaskRequest = {
            plannedTask: updateTask,
        };

        const response = await request(app)
            .put(url)
            .set('client-version', version)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send(updateRequest);
        const responseBody: UpdatePlannedTaskResponse = response.body;
        const updatedPlannedTask = responseBody.plannedTask;

        // verify response does not have time of day id
        expect(response.status).toEqual(200);
        expect(updatedPlannedTask?.timeOfDayId).toBeUndefined();

        // verify database in good state
        const databasePlannedHabit = await PlannedHabitDao.get(updatedPlannedTask!.id!);
        expect(databasePlannedHabit?.timeOfDayId).toEqual(5);
    });

    test('get planned day', async () => {
        const url = `/planned-day/${user.id}/${createdPlannedDay.dayKey}`;
        const response = await request(app)
            .get(url)
            .set('client-version', version)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send();
        const responseBody: GetPlannedDayResponse = response.body;
        const plannedDay: PlannedDay = responseBody.plannedDay!;
        const tasks = plannedDay.plannedTasks?.filter((task: PlannedTask) => {
            return task.id === plannedTaskToRead.id;
        });

        expect(tasks?.length).toEqual(1);
        tasks?.forEach((task: PlannedTask) => {
            expect(task.timeOfDayId).toBeUndefined();
        });
    });
});
