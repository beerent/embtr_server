import app from '@src/app';
import { TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';
import { AccountService } from '@src/service/AccountService';
import { AuthenticationDao } from '@src/database/AuthenticationDao';
import { Code } from '@resources/codes';
import { Role } from '@src/roles/Roles';
import { PushNotificationTokenService } from '@src/service/PushNotificationTokenService';
import { Context } from '@src/general/auth/Context';
import { CreatePushNotificationTokenRequest } from '@resources/types/requests/NotificationTypes';
import {
    CreateUserPostRequest,
    CreateUserPostResponse,
} from '@resources/types/requests/UserPostTypes';
import { HttpCode } from '@src/common/RequestResponses';
import { AccountDao } from '@src/database/AccountDao';
import { UserPostDao } from '@src/database/UserPostDao';

describe('create user workflow tests', () => {
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

describe('delete user workflow tests', () => {
    const EMAIL = 'test_delete_user_workflow@embtr.com';
    const ADMIN_EMAIL = 'delete_account_admin@embtr.com';
    const PASSWORD = 'Password1!';

    beforeAll(async () => {
        await TestUtility.deleteAccountWithUser(EMAIL);
        await TestUtility.deleteAccountWithUser(ADMIN_EMAIL);
    });

    afterAll(async () => {
        await TestUtility.deleteAccountWithUser(EMAIL);
        await TestUtility.deleteAccountWithUser(ADMIN_EMAIL);
    });

    // increate test
    test('delete user workflow', async () => {
        const adminUser = await TestUtility.createAccountWithUser(
            ADMIN_EMAIL,
            PASSWORD,
            Role.ADMIN
        );

        // 1. create firebase account
        const createFirebaseAccountResponse = await request(app).post('/account/create/').send({
            email: EMAIL,
            password: PASSWORD,
        });
        expect(createFirebaseAccountResponse.status).toEqual(200);

        // 2. verify email
        await AccountService.manuallyVerifyEmail(EMAIL);

        // 3. create user
        let token = await AuthenticationDao.generateValidIdToken(EMAIL, PASSWORD);
        const verifyInitialGetSucceedsResponse = await request(app)
            .post('/user/')
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(verifyInitialGetSucceedsResponse.status).toEqual(200);
        token = await AuthenticationDao.generateValidIdToken(EMAIL, PASSWORD);

        // create user post
        const createUserPost: CreateUserPostRequest = {
            userPost: {
                title: 'hi',
                body: 'bye',
            },
        };

        const response = await request(app)
            .post('/user-post/v1/')
            .set('Authorization', `Bearer ${token}`)
            .send(createUserPost);
        const createUserPostResponse: CreateUserPostResponse = response.body;
        expect(createUserPostResponse.success).toEqual(true);
        const postId = createUserPostResponse.userPost?.id;

        // delete account fail
        const hardDeleteResponse = await request(app)
            .post(`/account/v1/${EMAIL}/hard-delete`)
            .set('Authorization', `Bearer ${token}`)
            .send(createUserPost);
        expect(hardDeleteResponse.status).toEqual(HttpCode.FORBIDDEN);

        const adminDeleteResponse = await request(app)
            .post(`/account/v1/${EMAIL}/hard-delete`)
            .set('Authorization', `Bearer ${adminUser.token}`)
            .send(createUserPost);
        expect(adminDeleteResponse.status).toEqual(HttpCode.SUCCESS);

        const account = await AccountDao.getByEmail(EMAIL);
        expect(account).toEqual(undefined);

        const post = await UserPostDao.getById(postId!);
        expect(post).toEqual(null);
    }, 20000);
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
        const registerRequest: CreatePushNotificationTokenRequest = {
            token: 'test_token',
        };

        const response = await request(app)
            .post('/user/createPushNotificationToken/v1/')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send(registerRequest);
        expect(response.status).toEqual(200);

        const context: Context = {
            userId: testUser.user.id,
            userUid: testUser.user.uid,
            userEmail: EMAIL,
            userRoles: [],
        };

        const user = await PushNotificationTokenService.getAllForUser(context);
        expect(user.length).toEqual(1);
    });

    test('test does not add duplicate token', async () => {
        const testUser = await TestUtility.createAccountWithUser(EMAIL, PASSWORD, Role.USER);
        const registerRequest: CreatePushNotificationTokenRequest = {
            token: 'test_token',
        };

        await request(app)
            .post('/user/createPushNotificationToken/v1/')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send(registerRequest);

        await request(app)
            .post('/user/createPushNotificationToken/v1/')
            .set('Authorization', `Bearer ${testUser.token}`)
            .send(registerRequest);

        const context: Context = {
            userId: testUser.user.id,
            userUid: testUser.user.uid,
            userEmail: EMAIL,
            userRoles: [],
        };

        const user = await PushNotificationTokenService.getAllForUser(context);
        expect(user.length).toEqual(1);
    });
});
