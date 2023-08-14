import { GetHabitJourneyResponse } from '@resources/types/requests/HabitTypes';
import app from '@src/app';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { TaskController } from '@src/controller/TaskController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('HabitJourneyService', () => {
    const ACCOUNT_WITH_NO_ROLES = 'hjs_account_no_roles@embtr.com';
    let USER_ACCOUNT_WITH_NO_ROLES: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE = 'hjs_account_user_role@embtr.com';
    let USER_ACCOUNT_WITH_USER_ROLE: TestAccountWithUser;

    beforeAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
        ];
        await Promise.all(deletes);

        const creates = [
            TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER),
        ];
        const [noRoleUser, userRoleUser] = await Promise.all(creates);
        USER_ACCOUNT_WITH_NO_ROLES = noRoleUser;
        USER_ACCOUNT_WITH_USER_ROLE = userRoleUser;
    });

    afterAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
        ];
        await Promise.all(deletes);
    });

    describe.only('get habit journey for user under threshold', () => {
        beforeAll(async () => {
            await TaskController.deleteByTitle('task 1');
            const task1 = await TaskController.create('task 1', 'description 1');

            await TaskController.deleteByTitle('task 2');
            const task2 = await TaskController.create('task 2', 'description 2');

            const plannedDay1 = await PlannedDayController.create(
                USER_ACCOUNT_WITH_USER_ROLE.user.id,
                new Date('2023-02-01'),
                '2023-02-01'
            );

            const plannedDay2 = await PlannedDayController.create(
                USER_ACCOUNT_WITH_USER_ROLE.user.id,
                new Date('2023-02-12'),
                '2023-02-12'
            );
        });

        afterAll(async () => {
            await TaskController.deleteByTitle('task 1');
            await TaskController.deleteByTitle('task 2');
        });

        test('get', async () => {
            const response = await request(app)
                .get(`/user/${USER_ACCOUNT_WITH_USER_ROLE.user.id}/habit-journey/`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            const responseBody: GetHabitJourneyResponse = response.body;

            expect(response.status).toBe(200);
        });
    });
});
