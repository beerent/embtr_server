import { TestUtility } from '@test/test_utility/TestUtility';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import request from 'supertest';
import app from '@src/app';
import { ScheduledHabitDao } from '@src/database/ScheduledHabitDao';
import { TaskDao } from '@src/database/TaskDao';
import { PlannedHabitDao } from '@src/database/PlannedHabitDao';
import { PlannedTask } from '@resources/schema';
import { GetPlannedHabitResponse } from '@resources/types/requests/PlannedTaskTypes';

describe('PlannedHabitRouterLatest', () => {
    let user: any;
    let USER_TOKEN: string;

    let createdPlannedDay: any;
    let createdTask: any;
    let createdScheduledHabit: any;
    let createdPlannedHabit: any;

    const version = '2.0.0';
    const email = 'ph_router_latest_test@embtr.com';
    const password = 'password';
    const dayKey = '2021-01-01';
    const taskTitle = 'pdrl_test_task';

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

        // create planned task to read
        createdPlannedHabit = await PlannedHabitDao.create({
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

    test('get planned day', async () => {
        const url = `/planned-habit/${createdPlannedHabit.id}/`;
        const response = await request(app)
            .get(url)
            .set('client-version', version)
            .set('Authorization', `Bearer ${USER_TOKEN}`)
            .send();
        const responseBody: GetPlannedHabitResponse = response.body;
        const plannedHabit: PlannedTask = responseBody.plannedHabit!;
        expect(plannedHabit.timeOfDayId).toEqual(5);

        const databasePlannedHabit = await PlannedHabitDao.get(createdPlannedHabit.id);
        expect(databasePlannedHabit?.timeOfDayId).toEqual(5);
    });
});
