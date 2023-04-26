import { ACCOUNT, ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT } from '@resources/endpoints';
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
import {
    CreateAccountRequest,
    ForgotAccountPasswordRequest,
    VerifyAccountEmailRequest,
} from '@resources/types/requests/AccountTypes';
import { AuthenticationRequest } from '@resources/types/requests/RequestTypes';

describe('account service tests', () => {
    const ACCOUNT_THAT_EXISTS = 'ast_email_that_exists@embtr.com';
    const ACCOUNT_TO_CREATE = 'ast_email_to_create@embtr.com';
    const ACCOUNT_TO_VERIFY_EMAIL = 'ast_email_to_verify@embtr.com';

    beforeAll(async () => {
        const deletes = [
            AccountController.delete(ACCOUNT_THAT_EXISTS),
            AccountController.delete(ACCOUNT_TO_CREATE),
            AccountController.delete(ACCOUNT_TO_VERIFY_EMAIL),
        ];
        await Promise.all(deletes);

        const creates = [
            AccountController.create(ACCOUNT_THAT_EXISTS, 'password'),
            AccountController.create(ACCOUNT_TO_VERIFY_EMAIL, 'password'),
        ];
        await Promise.all(creates);
    });

    afterAll(async () => {
        const deletes = [
            AccountController.delete(ACCOUNT_THAT_EXISTS),
            AccountController.delete(ACCOUNT_TO_CREATE),
            AccountController.delete(ACCOUNT_TO_VERIFY_EMAIL),
        ];
        await Promise.all(deletes);
    });

    beforeEach(async () => {
        EmailController.sendEmail = jest.fn();
    });

    afterEach(async () => {
        EmailController.sendEmail = jest.requireActual(
            '@src/controller/EmailController'
        ).EmailController.sendEmail;
    });

    describe('create user', () => {
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

        //todo create invalid check - such as 'a'

        test('an account that already exists', async () => {
            const body: CreateAccountRequest = { email: ACCOUNT_THAT_EXISTS, password: 'password' };
            const response = await request(app).post('/account/create').send(body);

            expect(response.statusCode).toBe(CREATE_ACCOUNT_EMAIL_IN_USE.httpCode);
            expect(response.body).toEqual(CREATE_ACCOUNT_EMAIL_IN_USE);
        });

        describe('success cases', () => {
            test('create a account results in success', async () => {
                const body: CreateAccountRequest = {
                    email: ACCOUNT_TO_CREATE,
                    password: 'password',
                };
                const response = await request(app).post('/account/create').send(body);

                expect(response.statusCode).toBe(SUCCESS.httpCode);
                expect(response.body).toEqual(SUCCESS);
            });

            test('create a account sends a verification email', async () => {
                const email = 'create_a_user2@embtr.com';

                await AccountController.delete(email);
                const body: CreateAccountRequest = { email: email, password: 'password' };
                await request(app).post('/account/create').send(body);

                expect(EmailController.sendEmail).toHaveBeenCalled();
            });
        });
    });

    describe('forgot password', () => {
        test('missing email in body', async () => {
            const response = await request(app).post('/account/forgot_password').send({});

            expect(response.statusCode).toBe(FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL.httpCode);
            expect(response.body).toEqual(FORGOT_ACCOUNT_PASSWORD_INVALID_EMAIL);
        });

        test('user not found', async () => {
            const body: ForgotAccountPasswordRequest = { email: 'unknown_email_test@embtr.com' };
            const response = await request(app).post('/account/forgot_password').send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('success', async () => {
            const body: ForgotAccountPasswordRequest = { email: ACCOUNT_THAT_EXISTS };
            const response = await request(app).post('/account/forgot_password').send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('forgot password email sends an email', async () => {
            const body: ForgotAccountPasswordRequest = { email: ACCOUNT_THAT_EXISTS };
            await request(app).post('/account/forgot_password').send(body);

            expect(EmailController.sendEmail).toHaveBeenCalled();
        });
    });

    describe('send verification email', () => {
        test('missing email in body', async () => {
            const response = await request(app)
                .post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT)
                .send({});

            expect(response.statusCode).toBe(
                SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL.httpCode
            );
            expect(response.body).toEqual(SEND_ACCOUNT_VERIFICATION_EMAIL_INVALID_EMAIL);
        });

        test('user not found', async () => {
            const body: VerifyAccountEmailRequest = { email: 'unknown_email@embtr.com' };
            const response = await request(app)
                .post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT)
                .send(body);

            expect(response.statusCode).toBe(
                SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL.httpCode
            );
            expect(response.body).toEqual(SEND_ACCOUNT_VERIFICATION_EMAIL_UNKNOWN_EMAIL);
        });

        test('send verify email multiple times', async () => {
            const body: VerifyAccountEmailRequest = { email: 'send_verify_email_test@embtr.com' };
            await request(app).post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT).send(body);
            const response = await request(app)
                .post(ACCOUNT_SEND_EMAIL_VERIFICATION_ENDPOINT)
                .send(body);

            expect(response.statusCode).toBe(
                SEND_ACCOUNT_VERIFICATION_EMAIL_TOO_MANY_ATTEMPTS.httpCode
            );
        });

        test('success', async () => {
            const body: VerifyAccountEmailRequest = { email: ACCOUNT_TO_VERIFY_EMAIL };
            const response = await request(app)
                .post(`${ACCOUNT}send_verification_email`)
                .send(body);

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
            expect(EmailController.sendEmail).toHaveBeenCalled();
        });
    });

    describe('authenticate', () => {
        test('missing email in body', async () => {
            const response = await request(app)
                .post('/account/authenticate')
                .send({ password: 'password' });

            expect(response.statusCode).toBe(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS.httpCode);
            expect(response.body).toEqual(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS);
        });

        test('missing password in body', async () => {
            const response = await request(app)
                .post('/account/authenticate')
                .send({ email: 'email@embtr.com' });

            expect(response.statusCode).toBe(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS.httpCode);
            expect(response.body).toEqual(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS);
        });

        test('incorrect user/password', async () => {
            const body: AuthenticationRequest = {
                email: ACCOUNT_THAT_EXISTS,
                password: 'notthepassword',
            };
            const response = await request(app).post('/account/authenticate').send(body);

            expect(response.statusCode).toBe(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS.httpCode);
            expect(response.body).toEqual(ACCOUNT_AUTHENTICATION_INVALID_CREDENTIALS);
        });

        test('successfully returns token', async () => {
            const response = await request(app)
                .post('/account/authenticate')
                .send({ email: ACCOUNT_THAT_EXISTS, password: 'password' });

            expect(response.statusCode).toBe(SUCCESS.httpCode);
            expect(response.body.token).toBeTruthy();
        });
    });
});
