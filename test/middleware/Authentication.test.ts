import { AuthenticationController } from '@src/controller/AuthenticationController';
import { AccountController } from '@src/controller/AccountController';
import { UserController } from '@src/controller/UserController';
import { authenticate } from '@src/middleware/authentication';
import { Request, Response } from 'express';

const sendAuthRequest = async (token: string) => {
    const next = jest.fn();

    const request = {
        headers: {
            authorization: `Bearer ${token}`,
        },
    } as Request;

    const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await authenticate(request, response, next);

    return response;
};

describe('Authentication middleware', () => {
    const email = 'test_userid_cc@embtr.com';
    const password = 'password';

    beforeAll(async () => {
        await AccountController.delete(email);
        const result = await AccountController.create(email, password);
        await UserController.deleteByEmail(email);
        await UserController.create(result.user?.uid!, email);
    });

    test('adds userId to custom claims and returns 401', async () => {
        // initial account does not have db userId in custom claims
        const initialToken = await AuthenticationController.generateValidIdToken(email, password);
        const initialResponse = await sendAuthRequest(initialToken);
        expect(initialResponse.status).toHaveBeenCalledWith(401);

        // after an auth attempt, the custom claims should be updated
        const token = await AuthenticationController.generateValidIdToken(email, password);
        const finalResponse = await sendAuthRequest(token);
        expect(finalResponse.status).not.toHaveBeenCalled();
    });
});
