import { USER } from '@resources/endpoints';
import app from '@src/app';
import { FORBIDDEN, GET_USER_SUCCESS, UNAUTHORIZED } from '@src/common/RequestResponses';
import { AccountController } from '@src/controller/AccountController';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { INVALID_ROLE, Role } from '@src/roles/Roles';
import request from 'supertest';

describe.skip('get user', () => {
    describe('invalid requests', () => {
        test('get user with missing token', async () => {
            const response = await request(app).get(`${USER}/uid`).send();
            expect(response.statusCode).toBe(UNAUTHORIZED.httpCode);
        });

        test('get user with invalid token', async () => {
            const response = await request(app).get(`${USER}/uid`).set('Authorization', `Bearer invalid}`).send();
            expect(response.statusCode).toBe(UNAUTHORIZED.httpCode);
        });
    });

    describe('forbidden requests', () => {
        const email = 'forbidden@embtr.com';

        beforeAll(async () => {
            await AccountController.delete(email);
            await AccountController.create(email, 'password');
        });

        test('get account with valid token unsupported role', async () => {
            const account = await AccountController.get(email);
            AccountController.updateAccountRoles(account!, [Role.INVALID]);

            const token = await AuthenticationController.generateValidIdToken(email, 'password');
            const response = await request(app).get(`${USER}/uid`).set('Authorization', `Bearer ${token}`).send();

            expect(response.statusCode).toBe(FORBIDDEN.httpCode);
        });
    });

    describe('successful requests', () => {
        const requestedEmail = 'get_user_requested@embtr.com';
        const requesterEmail = 'get_user_requester@embtr.com';
        let requestedUid: string = '';

        beforeAll(async () => {
            await AccountController.delete(requestedEmail);
            await AccountController.delete(requesterEmail);
            requestedUid = (await AccountController.create(requestedEmail, 'password')).user?.uid!;
            const requester = await AccountController.create(requesterEmail, 'password');
            AccountController.updateAccountRoles(requester.user!, [Role.ADMIN]);
        });

        test.only('get user with valid token and permissions', async () => {
            const token = await AuthenticationController.generateValidIdToken(requesterEmail, 'password');
            const response = await request(app).get(`${USER}/${requestedUid}`).set('Authorization', `Bearer ${token}`).send();

            expect(response.statusCode).toBe(GET_USER_SUCCESS.httpCode);
            expect(response.body.user.uid).toBe(requestedUid);
            expect(response.body.user.email).toBe(requestedEmail);
        });
    });
});
