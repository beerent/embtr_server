import app from '@src/app';
import { TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';
import { AccountService } from '@src/service/AccountService';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { Code } from '@resources/codes';
import { Role } from '@src/roles/Roles';
import { RegisterPushNotificationTokenRequest } from '@resources/types/requests/NotificationTypes';
import { PushNotificationTokenService } from '@src/service/PushNotificationTokenService';
import { Context } from '@src/general/auth/Context';

describe('user workflow tests', () => {
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

describe('register push notification workflow', () => {
    const EMAIL = 'reg_push_noti_test@embtr.com';
    const PASSWORD = 'Password1!';

    beforeEach(async () => {
        await TestUtility.deleteAccountWithUser(EMAIL);
    });

    afterEach(async () => {
        await TestUtility.deleteAccountWithUser(EMAIL);
    });

    test('test can add token', async () => {
        const testUser = await TestUtility.createAccountWithUser(EMAIL, PASSWORD, Role.USER);
        const registerRequest: RegisterPushNotificationTokenRequest = {
            token: 'test_token',
        };

        const response = await request(app)
            .post('/user/registerPushNotificationToken/v1/')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send(registerRequest);
        expect(response.status).toEqual(200);

        const context: Context = {
            userId: testUser.user.id,
            userUid: testUser.user.uid,
            userEmail: EMAIL,
        };

        const user = await PushNotificationTokenService.getAllForUser(context);
        expect(user.length).toEqual(1);
    });

    test('test does not add duplicate token', async () => {
        const testUser = await TestUtility.createAccountWithUser(EMAIL, PASSWORD, Role.USER);
        const registerRequest: RegisterPushNotificationTokenRequest = {
            token: 'test_token',
        };

        await request(app)
            .post('/user/registerPushNotificationToken/v1/')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send(registerRequest);

        await request(app)
            .post('/user/registerPushNotificationToken/v1/')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send(registerRequest);

        const context: Context = {
            userId: testUser.user.id,
            userUid: testUser.user.uid,
            userEmail: EMAIL,
        };

        const user = await PushNotificationTokenService.getAllForUser(context);
        expect(user.length).toEqual(1);
    });
});
