import app from '@src/app';
import { UserController } from '@src/auth/UserController';
import { CREATE_USER_EMAIL_IN_USE, CREATE_USER_INVALID_EMAIL, CREATE_USER_INVALID_PASSWORD, SUCCESS } from '@src/common/RequestResponses';
import request from 'supertest';

describe('create user fail cases', () => {
    test('email is missing', async () => {
        const body = {};
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(CREATE_USER_INVALID_EMAIL.code);
        expect(response.body).toEqual(CREATE_USER_INVALID_EMAIL);
    });

    test('email is invalid', async () => {
        const body = { email: 'email' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(CREATE_USER_INVALID_EMAIL.code);
        expect(response.body).toEqual(CREATE_USER_INVALID_EMAIL);
    });

    test('password is missing', async () => {
        const body = { email: 'email@embtr.com' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(CREATE_USER_INVALID_PASSWORD.code);
        expect(response.body).toEqual(CREATE_USER_INVALID_PASSWORD);
    });

    test('a user that already exists', async () => {
        const body = { email: 'brentryczak@gmail.com', password: 'password' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(CREATE_USER_EMAIL_IN_USE.code);
        expect(response.body).toEqual(CREATE_USER_EMAIL_IN_USE);
    });
});

describe('create user success case', () => {
    beforeEach(async () => {
        await UserController.deleteUser('user@email.com');
    });

    test('create a user', async () => {
        const body = { email: 'user@email.com', password: 'password' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(SUCCESS.code);
        expect(response.body).toEqual(SUCCESS);
    });
});
