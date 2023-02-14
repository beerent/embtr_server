import { CreateUserRequest, ForgotPasswordRequest } from '@resources/types';
import app from '@src/app';
import { UserController } from '@src/auth/UserController';
import {
    CREATE_USER_EMAIL_IN_USE,
    CREATE_USER_INVALID_EMAIL,
    CREATE_USER_INVALID_PASSWORD,
    FORGOT_PASSWORD_INVALID_EMAIL,
    FORGOT_PASSWORD_UNKNOWN_EMAIL,
    SUCCESS,
} from '@src/common/RequestResponses';
import { EmailController } from '@src/notifications/email/EmailController';
import request from 'supertest';

/*
 * CREATE USER
 */
describe('create user fail cases', () => {
    test('email is missing', async () => {
        const body = {};
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(CREATE_USER_INVALID_EMAIL.httpCode);
        expect(response.body).toEqual(CREATE_USER_INVALID_EMAIL);
    });

    test('email is invalid', async () => {
        const body = { email: 'email', password: 'password' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(CREATE_USER_INVALID_EMAIL.httpCode);
        expect(response.body).toEqual(CREATE_USER_INVALID_EMAIL);
    });

    describe('with risk of creating user', () => {
        beforeEach(async () => {
            await UserController.deleteUser('test_passwordismissing@email.com');
        });

        test('password is missing', async () => {
            const body = { email: 'test_passwordismissing@embtr.com' };
            const response = await request(app).post('/user/create').send(body);

            expect(response.statusCode).toBe(CREATE_USER_INVALID_PASSWORD.httpCode);
            expect(response.body).toEqual(CREATE_USER_INVALID_PASSWORD);
        });
    });

    test('a user that already exists', async () => {
        const body: CreateUserRequest = { email: 'brentryczak@gmail.com', password: 'password' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(CREATE_USER_EMAIL_IN_USE.httpCode);
        expect(response.body).toEqual(CREATE_USER_EMAIL_IN_USE);
    });
});

describe('create user success case', () => {
    const email = 'test@embtr.com';

    beforeEach(async () => {
        await UserController.deleteUser(email);
        EmailController.sendEmail = jest.fn();
    });

    afterEach(async () => {
        EmailController.sendEmail = jest.requireActual('@src/notifications/email/EmailController').EmailController.sendEmail;
    });

    test('create a user', async () => {
        const body: CreateUserRequest = { email: email, password: 'password' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(SUCCESS.httpCode);
        expect(response.body).toEqual(SUCCESS);
    });

    test('create a user sends a verification email', async () => {
        const body: CreateUserRequest = { email: email, password: 'password' };
        await request(app).post('/user/create').send(body);

        expect(EmailController.sendEmail).toHaveBeenCalled();
    });
});

/*
 * FORGOT PASSWORD
 */

describe('forgot password fail cases', () => {
    test('missing email in body', async () => {
        const response = await request(app).post('/user/forgot_password').send({});

        expect(response.statusCode).toBe(FORGOT_PASSWORD_INVALID_EMAIL.httpCode);
        expect(response.body).toEqual(FORGOT_PASSWORD_INVALID_EMAIL);
    });

    test('user not found', async () => {
        const body: ForgotPasswordRequest = { email: 'unknown_email' };
        const response = await request(app).post('/user/forgot_password').send(body);

        expect(response.statusCode).toBe(FORGOT_PASSWORD_UNKNOWN_EMAIL.httpCode);
        expect(response.body).toEqual(FORGOT_PASSWORD_UNKNOWN_EMAIL);
    });
});

describe('forgot password success case', () => {
    const email = 'forgot_password_test@embtr.com';
    beforeAll(async () => {
        await UserController.deleteUser(email);
        await UserController.createUser({ email: email, password: 'password' });
    });

    test('send forgot password email', async () => {
        const body: ForgotPasswordRequest = { email: email };
        const response = await request(app).post('/user/forgot_password').send(body);

        expect(response.statusCode).toBe(SUCCESS.httpCode);
        expect(response.body).toEqual(SUCCESS);
    });

    test('send forgot password email sends an email', async () => {
        EmailController.sendEmail = jest.fn();

        const body: ForgotPasswordRequest = { email: email };
        await request(app).post('/user/forgot_password').send(body);

        expect(EmailController.sendEmail).toHaveBeenCalled();

        EmailController.sendEmail = jest.requireActual('@src/notifications/email/EmailController').EmailController.sendEmail;
    });
});
