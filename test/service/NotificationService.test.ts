import { NOTIFICATION } from '@resources/endpoints';
import { NotificationTargetPage } from '@resources/schema';
import { ClearNotificationsRequest } from '@resources/types/requests/NotificationTypes';
import app from '@src/app';
import { SUCCESS } from '@src/common/RequestResponses';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { NotificationDao } from '@src/database/NotificationDao';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('notification', () => {
    describe('get notifications', () => {
        const email = 'notificationgetall@embtr.com';
        let accountWithUser: TestAccountWithUser;
        let userToken: string;

        beforeAll(async () => {
            await TestUtility.deleteAccountWithUser(email);
            accountWithUser = await TestUtility.createAccountWithUser(email, 'password', Role.USER);
            userToken = await AuthenticationDao.generateValidIdToken(email, 'password');
        });

        afterAll(async () => {
            await TestUtility.deleteAccountWithUser(email);
        });

        test('valid', async () => {
            const notifications = [
                NotificationDao.create(accountWithUser.user.id, accountWithUser.user.id, 'I am a noti', NotificationTargetPage.INVALID, 0),
                NotificationDao.create(accountWithUser.user.id, accountWithUser.user.id, 'I am a noti', NotificationTargetPage.INVALID, 0),
                NotificationDao.create(accountWithUser.user.id, accountWithUser.user.id, 'I am a noti', NotificationTargetPage.INVALID, 0),
            ];
            await Promise.all(notifications);

            const response = await request(app).get(`${NOTIFICATION}`).set('Authorization', `Bearer ${userToken}`).send();
            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.notifications).toHaveLength(3);
        });
    });

    describe('clear notifications', () => {
        const email = 'clearnotifications@embtr.com';
        let accountWithUser: TestAccountWithUser;
        let userToken: string;
        let notificationIds: number[] = [];

        beforeAll(async () => {
            await TestUtility.deleteAccountWithUser(email);
            accountWithUser = await TestUtility.createAccountWithUser(email, 'password', Role.USER);
            userToken = await AuthenticationDao.generateValidIdToken(email, 'password');
            const notifications = [
                NotificationDao.create(accountWithUser.user.id, accountWithUser.user.id, 'I am a noti', NotificationTargetPage.INVALID, 0),
                NotificationDao.create(accountWithUser.user.id, accountWithUser.user.id, 'I am a noti', NotificationTargetPage.INVALID, 0),
                NotificationDao.create(accountWithUser.user.id, accountWithUser.user.id, 'I am a noti', NotificationTargetPage.INVALID, 0),
            ];
            const [notification1, notification2, notification3] = await Promise.all(notifications);
            notificationIds = [notification1.id, notification2.id, notification3.id];
        });

        afterAll(async () => {
            await TestUtility.deleteAccountWithUser(email);
        });

        test('clear', async () => {
            const body: ClearNotificationsRequest = {
                notificationIds,
            };

            const response = await request(app).post(`${NOTIFICATION}clear`).set('Authorization', `Bearer ${userToken}`).send(body);
            expect(response.status).toEqual(SUCCESS.httpCode);

            const notifications = await NotificationDao.getAll(accountWithUser.user.id);
            for (const notification of notifications) {
                expect(notification.read).toBeTruthy();
            }
        });
    });
});
