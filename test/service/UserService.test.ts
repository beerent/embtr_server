import { USER_SEND_EMAIL_VERIFICATION_ENDPOINT } from '@resources/endpoints';
import { CreateUserRequest, ForgotPasswordRequest, VerifyEmailRequest } from '@resources/types';
import app from '@src/app';
import {
    CREATE_USER_EMAIL_IN_USE,
    CREATE_USER_INVALID_EMAIL,
    CREATE_USER_INVALID_PASSWORD,
    FORGOT_PASSWORD_INVALID_EMAIL,
    FORGOT_PASSWORD_UNKNOWN_EMAIL,
    SEND_VERIFICATION_EMAIL_INVALID_EMAIL,
    SEND_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS,
    SEND_VERIFICATION_EMAIL_UNKNOWN_EMAIL,
    SUCCESS,
} from '@src/common/RequestResponses';
import { EmailController } from '@src/controller/EmailController';
import { UserController } from '@src/controller/UserController';
import request from 'supertest';

describe('create user', () => {
    describe('fail cases', () => {
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

        test('password is missing', async () => {
            const body = { email: 'test_passwordismissing@embtr.com' };
            const response = await request(app).post('/user/create').send(body);

            expect(response.statusCode).toBe(CREATE_USER_INVALID_PASSWORD.httpCode);
            expect(response.body).toEqual(CREATE_USER_INVALID_PASSWORD);
        });

        test('a user that already exists', async () => {
            const body: CreateUserRequest = { email: 'brent@embtr.com', password: 'password' };
            const response = await request(app).post('/user/create').send(body);

            expect(response.statusCode).toBe(CREATE_USER_EMAIL_IN_USE.httpCode);
            expect(response.body).toEqual(CREATE_USER_EMAIL_IN_USE);
        });
    });

    describe('success cases', () => {
        beforeEach(async () => {
            EmailController.sendEmail = jest.fn();
        });

        afterEach(async () => {
            EmailController.sendEmail = jest.requireActual('@src/controller/EmailController').EmailController.sendEmail;
        });

        test('create a user results in success', async () => {
            const email = 'create_a_user_test@embtr.com';

            await UserController.delete(email);
            const body: CreateUserRequest = { email: email, password: 'password' };
            const response = await request(app).post('/user/create').send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('create a user sends a verification email', async () => {
            const email = 'create_a_user2@embtr.com';

            await UserController.delete(email);
            const body: CreateUserRequest = { email: email, password: 'password' };
            await request(app).post('/user/create').send(body);

            expect(EmailController.sendEmail).toHaveBeenCalled();
        });
    });
});

describe('forgot password', () => {
    describe('fail cases', () => {
        test('missing email in body', async () => {
            const response = await request(app).post('/user/forgot_password').send({});

            expect(response.statusCode).toBe(FORGOT_PASSWORD_INVALID_EMAIL.httpCode);
            expect(response.body).toEqual(FORGOT_PASSWORD_INVALID_EMAIL);
        });

        test('user not found', async () => {
            const body: ForgotPasswordRequest = { email: 'unknown_email_test@embtr.com' };
            const response = await request(app).post('/user/forgot_password').send(body);

            expect(response.statusCode).toBe(FORGOT_PASSWORD_UNKNOWN_EMAIL.httpCode);
            expect(response.body).toEqual(FORGOT_PASSWORD_UNKNOWN_EMAIL);
        });
    });

    describe('success cases', () => {
        const email = 'forgot_password_test@embtr.com';

        beforeEach(async () => {
            EmailController.sendEmail = jest.fn();
            await UserController.delete(email);
            await UserController.create(email, 'password');
        });

        afterEach(async () => {
            EmailController.sendEmail = jest.requireActual('@src/controller/EmailController').EmailController.sendEmail;
        });

        test('send forgot password email results in success', async () => {
            const body: ForgotPasswordRequest = { email: email };
            const response = await request(app).post('/user/forgot_password').send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('send forgot password email sends an email', async () => {
            const body: ForgotPasswordRequest = { email: email };
            await request(app).post('/user/forgot_password').send(body);

            expect(EmailController.sendEmail).toHaveBeenCalled();
        });
    });
});

describe('send verification email', () => {
    describe('fail cases', () => {
        test('missing email in body', async () => {
            const response = await request(app).post(USER_SEND_EMAIL_VERIFICATION_ENDPOINT).send({});

            expect(response.statusCode).toBe(SEND_VERIFICATION_EMAIL_INVALID_EMAIL.httpCode);
            expect(response.body).toEqual(SEND_VERIFICATION_EMAIL_INVALID_EMAIL);
        });

        test('user not found', async () => {
            const body: VerifyEmailRequest = { email: 'unknown_email@embtr.com' };
            const response = await request(app).post(USER_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);

            expect(response.statusCode).toBe(SEND_VERIFICATION_EMAIL_UNKNOWN_EMAIL.httpCode);
            expect(response.body).toEqual(SEND_VERIFICATION_EMAIL_UNKNOWN_EMAIL);
        });

        test('send verify email multiple times', async () => {
            const body: VerifyEmailRequest = { email: 'send_verify_email_test@embtr.com' };
            await request(app).post(USER_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);
            const response = await request(app).post(USER_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);

            expect(response.statusCode).toBe(SEND_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS.httpCode);
        });
    });

    describe('success cases', () => {
        const email = 'send_verify_email_test@embtr.com';

        beforeEach(async () => {
            EmailController.sendEmail = jest.fn();
            await UserController.delete(email);
            await UserController.create(email, 'password');
        });

        afterEach(async () => {
            EmailController.sendEmail = jest.requireActual('@src/controller/EmailController').EmailController.sendEmail;
        });

        test('send verify email results in success', async () => {
            const body: VerifyEmailRequest = { email: email };
            const response = await request(app).post(USER_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('send verify email sends an email', async () => {
            const body: VerifyEmailRequest = { email: email };
            await request(app).post(USER_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);

            expect(EmailController.sendEmail).toHaveBeenCalled();
        });
    });
});
