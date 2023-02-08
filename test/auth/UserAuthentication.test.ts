import request from 'supertest';
import { EMAIL_ALREADY_IN_USE, INVALID_EMAIL, INVALID_PASSWORD } from 'src/common/RequestResponses';
import app from 'src/app';

describe('create user fail cases', () => {
    test('email is missing', async () => {
        const body = {};
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(INVALID_EMAIL.code);
        expect(response.body.message).toBe(INVALID_EMAIL.message);
    });

    test('password is missing', async () => {
        const body = { email: 'email' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(INVALID_PASSWORD.code);
        expect(response.body.message).toBe(INVALID_PASSWORD.message);
    });

    test('a user that already exists', async () => {
        const body = { email: 'brentryczak@gmail.com', password: 'password' };
        const response = await request(app).post('/user/create').send(body);

        expect(response.statusCode).toBe(EMAIL_ALREADY_IN_USE.code);
        expect(response.body.message).toBe(EMAIL_ALREADY_IN_USE.message);
    });
});
