import { Widget, WidgetType } from '@resources/schema';
import { UpdateWidgetsRequest } from '@resources/types/requests/WidgetTypes';
import app from '@src/app';
import { FORBIDDEN, INVALID_REQUEST, SUCCESS, UNAUTHORIZED } from '@src/common/RequestResponses';
import { WidgetController } from '@src/controller/WidgetController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('WidgetService', () => {
    const ACCOUNT_WITH_NO_ROLES = 'wst_account_no_roles@embtr.com';
    let USER_ACCOUNT_WITH_NO_ROLES: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE = 'wst_account_user_role@embtr.com';
    let USER_ACCOUNT_WITH_USER_ROLE: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE_2 = 'wst2_account_user_role@embtr.com';
    let USER_ACCOUNT_WITH_USER_ROLE_2: TestAccountWithUser;

    const USER_WITH_WIDGETS_EMAIL = 'wst3_account_user_role@embtr.com';
    let USER_WITH_WIDGETS: TestAccountWithUser;

    beforeAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2),
            TestUtility.deleteAccountWithUser(USER_WITH_WIDGETS_EMAIL),
        ];
        await Promise.all(deletes);

        const creates = [
            TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE_2, 'password', Role.USER),
            TestUtility.createAccountWithUser(USER_WITH_WIDGETS_EMAIL, 'password', Role.USER),
        ];
        const [noRoleUser, userRoleUser, userRoleUser2, userWithWidgets] = await Promise.all(creates);
        USER_ACCOUNT_WITH_NO_ROLES = noRoleUser;
        USER_ACCOUNT_WITH_USER_ROLE = userRoleUser;
        USER_ACCOUNT_WITH_USER_ROLE_2 = userRoleUser2;
        USER_WITH_WIDGETS = userWithWidgets;
    });

    afterAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2),
            TestUtility.deleteAccountWithUser(USER_WITH_WIDGETS_EMAIL),
        ];
        await Promise.all(deletes);
    });

    describe('update widgets for user', () => {
        test('unauthenticated', async () => {
            const response = await request(app).post('/widget').set('Authorization', 'Bearer Trash').send();
            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
        });

        test('insufficient permissions', async () => {
            const response = await request(app).post('/widget').set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`).send();
            expect(response.status).toEqual(FORBIDDEN.httpCode);
        });

        test('missing body', async () => {
            const response = await request(app).post('/widget').set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`).send();
            expect(response.status).toEqual(INVALID_REQUEST.httpCode);
        });

        test('invalid body', async () => {
            const body = {
                widgets: [
                    {
                        type: 'unknown',
                    },
                ],
            };

            const response = await request(app).post('/widget').set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`).send(body);
            expect(response.status).toEqual(INVALID_REQUEST.httpCode);
        });

        test('valid insert', async () => {
            const body: UpdateWidgetsRequest = {
                widgets: [
                    {
                        type: WidgetType.DAILY_HISTORY,
                        order: 12,
                    },
                ],
            };

            const response = await request(app).post('/widget').set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`).send(body);
            const widgets = await WidgetController.getAllForUser(USER_ACCOUNT_WITH_USER_ROLE.user.id);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(widgets[0].type).toEqual(WidgetType.DAILY_HISTORY);
            expect(widgets[0].order).toEqual(12);
        });

        test('valid update', async () => {
            const result = await WidgetController.create(USER_ACCOUNT_WITH_USER_ROLE_2.user.id, { type: WidgetType.DAILY_HISTORY, order: 1 });

            const body: UpdateWidgetsRequest = {
                widgets: [
                    {
                        id: result.id,
                        type: WidgetType.DAILY_HISTORY,
                        order: 2,
                    },
                ],
            };

            const response = await request(app).post('/widget').set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE_2.token}`).send(body);
            expect(response.status).toEqual(SUCCESS.httpCode);

            const widgets = await WidgetController.getAllForUser(USER_ACCOUNT_WITH_USER_ROLE_2.user.id);
            expect(widgets[0].type).toEqual(WidgetType.DAILY_HISTORY);
            expect(widgets[0].order).toEqual(2);
        });
    });

    describe('get widgets for user', () => {
        test('unauthenticated', async () => {
            const response = await request(app).get('/widget').set('Authorization', 'Bearer Trash').send();
            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
        });

        test('insufficient permissions', async () => {
            const response = await request(app).get('/widget').set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`).send();
            expect(response.status).toEqual(FORBIDDEN.httpCode);
        });

        test('valid', async () => {
            await WidgetController.create(USER_WITH_WIDGETS.user.id, { type: WidgetType.DAILY_HISTORY, order: 12 });
            const response = await request(app).get('/widget').set('Authorization', `Bearer ${USER_WITH_WIDGETS.token}`).send();
            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.widgets.length).toEqual(1);
        });

        test('valid does not return inactive widgets', async () => {
            const result = await WidgetController.create(USER_WITH_WIDGETS.user.id, { type: WidgetType.TIME_LEFT_IN_DAY, order: 1 });
            await WidgetController.update({ id: result.id, active: false });
            const response = await request(app).get('/widget').set('Authorization', `Bearer ${USER_WITH_WIDGETS.token}`).send();

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.widgets.filter((widget: Widget) => widget.type === WidgetType.TIME_LEFT_IN_DAY).length).toEqual(0);
            expect(response.body.widgets.filter((widget: Widget) => widget.active === false).length).toEqual(0);
        });

        test('update to widget with no id that already exists in database updates the existing widget', async () => {
            const result = await WidgetController.create(USER_WITH_WIDGETS.user.id, { type: WidgetType.QUOTE_OF_THE_DAY, order: 1 });
            await WidgetController.update({ id: result.id, active: false });

            const widgetToCreate: Widget = {
                type: WidgetType.QUOTE_OF_THE_DAY,
                order: 1,
            };

            const body: UpdateWidgetsRequest = {
                widgets: [widgetToCreate],
            };

            const response = await request(app).post('/widget').set('Authorization', `Bearer ${USER_WITH_WIDGETS.token}`).send(body);
            expect(response.status).toEqual(SUCCESS.httpCode);

            const widgetFromDatabase = await WidgetController.get(result.id);
            expect(widgetFromDatabase!.active).toEqual(true);
        });
    });
});
