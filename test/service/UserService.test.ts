import { USER } from '@resources/endpoints';
import app from '@src/app';
import { UNAUTHORIZED } from '@src/common/RequestResponses';
import request from 'supertest';

describe('get user', () => {
    describe('fail cases', () => {
        test('get user with missing token', async () => {
            const response = await request(app).get(`${USER}/uid`).send();
            expect(response.statusCode).toBe(UNAUTHORIZED.httpCode);
        });

        test('get user with invalid token', async () => {
            const response = await request(app).get(`${USER}/uid`).send();
            expect(response.statusCode).toBe(UNAUTHORIZED.httpCode);
        });
    });
});
