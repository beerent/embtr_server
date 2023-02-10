import { CreateUserRequest } from '@resources/types';
import app from '@src/app';
import { UserController } from '@src/auth/UserController';
import { CREATE_USER_EMAIL_IN_USE, CREATE_USER_INVALID_EMAIL, CREATE_USER_INVALID_PASSWORD, SUCCESS } from '@src/common/RequestResponses';
import request from 'supertest';

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
    beforeEach(async () => {
        await UserController.deleteUser('test_createauser@email.com');
    });

    test('create a user', async () => {
        const body: CreateUserRequest = { email: 'test_createauser@email.com', password: 'password' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(SUCCESS.httpCode);
        expect(response.body).toEqual(SUCCESS);
    });
});
