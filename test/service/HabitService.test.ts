import app from '@src/app';
import { FORBIDDEN, SUCCESS, UNAUTHORIZED } from '@src/common/RequestResponses';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('WidgetService', () => {
    let NO_ROLE_USER: TestAccountWithUser;
    let USER: TestAccountWithUser;

    beforeAll(async () => {
        NO_ROLE_USER = await TestUtility.createAccountWithUser(
            'habit_test_email1@embtr.com',
            'password',
            Role.INVALID
        );

        USER = await TestUtility.createAccountWithUser(
            'habit_test_email3@embtr.com',
            'password',
            Role.USER
        );
    });

    afterAll(async () => {
        await TestUtility.deleteAccountWithUser('habit_test_email1@embtr.com');
        await TestUtility.deleteAccountWithUser('habit_test_email3@embtr.com');
    });

    describe('get', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get('/habit')
                .set('Authorization', 'Bearer Trash')
                .send();
            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
        });

        test('insufficient permissions', async () => {
            const response = await request(app)
                .get('/habit')
                .set('Authorization', `Bearer ${NO_ROLE_USER.token}`)
                .send();
            expect(response.status).toEqual(FORBIDDEN.httpCode);
        });

        test('success', async () => {
            const response = await request(app)
                .get('/habit')
                .set('Authorization', `Bearer ${USER.token}`)
                .send();

            expect(response.status).toEqual(SUCCESS.httpCode);
        });
    });
});
