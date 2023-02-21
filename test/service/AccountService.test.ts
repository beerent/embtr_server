import { ACCOUNT, ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT } from '@resources/endpoints';
import { AuthenticationRequest, AuthenticationResponse, CreateAccountRequest, ForgotAccountPasswordRequest, VerifyAccountEmailRequest } from '@resources/types';
import app from '@src/app';
import {
    ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS,
    CREATE_ACCOUNT_EMAIL_IN_USE,
    CREATE_ACCOUNT_INVALID_EMAIL,
    CREATE_ACCOUNT_INVALID_PASSWORD,
    FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL,
    FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL,
    SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL,
    SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS,
    SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL,
    SUCCESS,
} from '@src/common/RequestResponses';
import { EmailController } from '@src/controller/EmailController';
import { AccountController } from '@src/controller/AccountController';
import request from 'supertest';

describe('create user', () => {
    describe('fail cases', () => {
        test('email is missing', async () => {
            const body = {};
            const response = await request(app).post('/account/create').send(body);

            expect(response.statusCode).toBe(CREATE_ACCOUNT_INVALID_EMAIL.httpCode);
            expect(response.body).toEqual(CREATE_ACCOUNT_INVALID_EMAIL);
        });

        test('email is invalid', async () => {
            const body = { email: 'email', password: 'password' };
            const response = await request(app).post('/account/create').send(body);

            expect(response.statusCode).toBe(CREATE_ACCOUNT_INVALID_EMAIL.httpCode);
            expect(response.body).toEqual(CREATE_ACCOUNT_INVALID_EMAIL);
        });

        test('password is missing', async () => {
            const body = { email: 'test_passwordismissing@embtr.com' };
            const response = await request(app).post('/account/create').send(body);

            expect(response.statusCode).toBe(CREATE_ACCOUNT_INVALID_PASSWORD.httpCode);
            expect(response.body).toEqual(CREATE_ACCOUNT_INVALID_PASSWORD);
        });

        test('a user that already exists', async () => {
            const body: CreateAccountRequest = { email: 'brent@embtr.com', password: 'password' };
            const response = await request(app).post('/account/create').send(body);

            expect(response.statusCode).toBe(CREATE_ACCOUNT_EMAIL_IN_USE.httpCode);
            expect(response.body).toEqual(CREATE_ACCOUNT_EMAIL_IN_USE);
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

            await AccountController.delete(email);
            const body: CreateAccountRequest = { email: email, password: 'password' };
            const response = await request(app).post('/account/create').send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('create a user sends a verification email', async () => {
            const email = 'create_a_user2@embtr.com';

            await AccountController.delete(email);
            const body: CreateAccountRequest = { email: email, password: 'password' };
            await request(app).post('/account/create').send(body);

            expect(EmailController.sendEmail).toHaveBeenCalled();
        });
    });
});

describe('forgot password', () => {
    describe('fail cases', () => {
        test('missing email in body', async () => {
            const response = await request(app).post('/account/forgot_password').send({});

            expect(response.statusCode).toBe(FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL.httpCode);
            expect(response.body).toEqual(FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL);
        });

        test('user not found', async () => {
            const body: ForgotAccountPasswordRequest = { email: 'unknown_email_test@embtr.com' };
            const response = await request(app).post('/account/forgot_password').send(body);

            expect(response.statusCode).toBe(FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL.httpCode);
            expect(response.body).toEqual(FORGOT_ACCOUNT_PASSWORD_UNKNOWN_EMAIL);
        });
    });

    describe('success cases', () => {
        const email = 'forgot_password_test@embtr.com';

        beforeEach(async () => {
            EmailController.sendEmail = jest.fn();
            await AccountController.delete(email);
            await AccountController.create(email, 'password');
        });

        afterEach(async () => {
            EmailController.sendEmail = jest.requireActual('@src/controller/EmailController').EmailController.sendEmail;
        });

        test('send forgot password email results in success', async () => {
            const body: ForgotAccountPasswordRequest = { email: email };
            const response = await request(app).post('/account/forgot_password').send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('send forgot password email sends an email', async () => {
            const body: ForgotAccountPasswordRequest = { email: email };
            await request(app).post('/account/forgot_password').send(body);

            expect(EmailController.sendEmail).toHaveBeenCalled();
        });
    });
});

describe('send verification email', () => {
    describe('fail cases', () => {
        test('missing email in body', async () => {
            const response = await request(app).post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT).send({});

            expect(response.statusCode).toBe(SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL.httpCode);
            expect(response.body).toEqual(SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL);
        });

        test('user not found', async () => {
            const body: VerifyAccountEmailRequest = { email: 'unknown_email@embtr.com' };
            const response = await request(app).post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);

            expect(response.statusCode).toBe(SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL.httpCode);
            expect(response.body).toEqual(SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL);
        });

        test('send verify email multiple times', async () => {
            const body: VerifyAccountEmailRequest = { email: 'send_verify_email_test@embtr.com' };
            await request(app).post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);
            const response = await request(app).post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);

            expect(response.statusCode).toBe(SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS.httpCode);
        });
    });

    describe('success cases', () => {
        const email = 'send_verify_email_test@embtr.com';

        beforeEach(async () => {
            EmailController.sendEmail = jest.fn();
            await AccountController.delete(email);
            await AccountController.create(email, 'password');
        });

        afterEach(async () => {
            EmailController.sendEmail = jest.requireActual('@src/controller/EmailController').EmailController.sendEmail;
        });

        test('send verify email results in success', async () => {
            const body: VerifyAccountEmailRequest = { email: email };
            const response = await request(app).post(`${ACCOUNT}send_verification_email`).send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('send verify email sends an email', async () => {
            const body: VerifyAccountEmailRequest = { email: email };
            await request(app).post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);

            expect(EmailController.sendEmail).toHaveBeenCalled();
        });
    });
});

describe('authenticate', () => {
    describe('fail cases', () => {
        test('missing email in body', async () => {
            const response = await request(app).post('/account/authenticate').send({ password: 'password' });

            expect(response.statusCode).toBe(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS.httpCode);
            expect(response.body).toEqual(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS);
        });

        test('missing password in body', async () => {
            const response = await request(app).post('/account/authenticate').send({ email: 'email@embtr.com' });

            expect(response.statusCode).toBe(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS.httpCode);
            expect(response.body).toEqual(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS);
        });

        test('incorrect user/password', async () => {
            const body: AuthenticationRequest = { email: 'test@embtr.com', password: 'password' };
            const response = await request(app).post('/account/authenticate').send(body);

            expect(response.statusCode).toBe(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS.httpCode);
            expect(response.body).toEqual(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS);
        });
    });

    describe('success case', () => {
        const email = 'authentication_test@embtr.com';
        beforeAll(async () => {
            await AccountController.delete(email);
            await AccountController.create(email, 'password');
        });

        test('successfully returns token', async () => {
            const response = await request(app).post('/account/authenticate').send({ email, password: 'password' });

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body.token).toBeTruthy();
        });
    });
});
