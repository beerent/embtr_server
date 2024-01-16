import app from '@src/app';
import { TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';
import { AccountService } from '@src/service/AccountService';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { Code } from '@resources/codes';

describe('create user workflow', () => {
    const EMAIL = 'test_create_user_workflow@embtr.com';
    const PASSWORD = 'Password1!';

    beforeAll(async () => {
        await TestUtility.deleteAccountWithUser(EMAIL);
    });

    afterAll(async () => {
        await TestUtility.deleteAccountWithUser(EMAIL);
    });

    test('create user workflow', async () => {
        // create firebase account
        const createFirebaseAccountResponse = await request(app).post('/account/create/').send({
            email: EMAIL,
            password: PASSWORD,
        });
        expect(createFirebaseAccountResponse.status).toEqual(200);

        // verify
        const badToken = await AuthenticationDao.generateValidIdToken(EMAIL, PASSWORD);
        const verifyInitialGetFailsResponse = await request(app)
            .post('/user/')
            .set('Authorization', `Bearer ${badToken}`)
            .send({});
        expect(verifyInitialGetFailsResponse.status).toEqual(403);
        expect(verifyInitialGetFailsResponse.body.internalCode).toEqual(Code.EMAIL_NOT_VERIFIED);

        await AccountService.manuallyVerifyEmail(EMAIL);

        const goodToken = await AuthenticationDao.generateValidIdToken(EMAIL, PASSWORD);
        const verifyInitialGetSucceedsResponse = await request(app)
            .post('/user/')
            .set('Authorization', `Bearer ${goodToken}`)
            .send({});
        const body = verifyInitialGetSucceedsResponse.body;
        expect(verifyInitialGetSucceedsResponse.status).toEqual(200);

        const x = await request(app)
            .get('/unit/')
            .set('Authorization', `Bearer ${goodToken}`)
            .send({});
        expect(x.status).toEqual(401);

        const bestToken = await AuthenticationDao.generateValidIdToken(EMAIL, PASSWORD);
        const y = await request(app)
            .get('/unit/')
            .set('Authorization', `Bearer ${bestToken}`)
            .send({});
        expect(y.status).toEqual(200);
        const done = true;
    });
});
