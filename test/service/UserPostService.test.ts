import { PLANNED_DAY, USER, USER_POST } from '@resources/endpoints';
import { Interactable } from '@resources/types/interactable/Interactable';
import { CreateCommentRequest } from '@resources/types/requests/GeneralTypes';
import { CreateUserPostRequest, GetAllUserPostResponse, GetUserPostResponse, UpdateUserPostRequest } from '@resources/types/requests/UserPostTypes';
import app from '@src/app';
import { FORBIDDEN, GENERAL_FAILURE, INVALID_REQUEST, RESOURCE_ALREADY_EXISTS, RESOURCE_NOT_FOUND, SUCCESS, UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { NotificationController } from '@src/controller/NotificationController';
import { UserPostController } from '@src/controller/UserPostController';
import { CommentController } from '@src/controller/common/CommentController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('user post service', () => {
    const ACCOUNT_WITH_NO_ROLES = 'up_account_no_roles@embtr.com';
    let ACCOUNT_WITH_NO_ROLES_TOKEN: string;

    const ACCOUNT_WITH_USER_ROLE = 'up_account_user_role@embtr.com';
    let ACCOUNT_WITH_USER_ROLE_TOKEN: string;
    let ACCOUNT_USER_WITH_USER_ROLE: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE_2 = 'up_account_user_role222@embtr.com';
    let ACCOUNT_WITH_USER_ROLE_TOKEN_2: string;
    let ACCOUNT_USER_WITH_USER_ROLE_2: TestAccountWithUser;

    let TEST_POST_ID: number;
    let TEST_POST_TO_DELETE_ID: number;

    beforeAll(async () => {
        //user deletes
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2),
        ];
        await Promise.all(deletes);

        //user creates
        const creates = [
            TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE_2, 'password', Role.USER),
        ];
        const [account1, account2, account3] = await Promise.all(creates);
        ACCOUNT_USER_WITH_USER_ROLE = account2;
        ACCOUNT_USER_WITH_USER_ROLE_2 = account3;

        //user authenticates
        const authenticates = [
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password'),
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password'),
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE_2, 'password'),
        ];
        const [token1, token2, token3] = await Promise.all(authenticates);
        ACCOUNT_WITH_NO_ROLES_TOKEN = token1;
        ACCOUNT_WITH_USER_ROLE_TOKEN = token2;
        ACCOUNT_WITH_USER_ROLE_TOKEN_2 = token3;

        //user posts
        const posts = [
            UserPostController.create({ userId: ACCOUNT_USER_WITH_USER_ROLE.user.id, body: 'test body' }),
            UserPostController.create({ userId: ACCOUNT_USER_WITH_USER_ROLE.user.id, body: 'test body' }),
        ];
        const [post1, post2] = await Promise.all(posts);
        TEST_POST_ID = post1.id;
        TEST_POST_TO_DELETE_ID = post2.id;
    });

    afterAll(async () => {
        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES);
        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE);
        await TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2);
    });

    describe('get by id', () => {
        test('unauthenticated', async () => {
            const response = await request(app).get(`${USER_POST}id`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app).get(`${USER_POST}id`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app).get(`${USER_POST}invalid`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(INVALID_REQUEST.httpCode);
            expect(response.body.userPost).toBeUndefined();
        });

        test('non-existing day result', async () => {
            const response = await request(app).get(`${USER_POST}0`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app).get(`${USER_POST}${TEST_POST_ID}`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(SUCCESS.httpCode);
            const responseObject: GetUserPostResponse = response.body;
            expect(responseObject?.userPost?.id).toEqual(TEST_POST_ID);
        });
    });

    describe('get all', () => {
        test('unauthenticated', async () => {
            const response = await request(app).get(`${USER_POST}`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app).get(`${USER_POST}`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app).get(`${USER_POST}`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(SUCCESS.httpCode);
            const responseObject: GetAllUserPostResponse = response.body;
            expect(responseObject?.userPosts.length).toBeGreaterThan(0);
        });
    });

    describe('create', () => {
        test('unauthenticated', async () => {
            const response = await request(app).post(`${USER_POST}`).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app).post(`${USER_POST}`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app).post(`${USER_POST}`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(INVALID_REQUEST.httpCode);
            expect(response.body.userPost).toBeUndefined();
        });

        test('valid', async () => {
            const body: CreateUserPostRequest = {
                userPost: {
                    title: 'test title',
                    body: 'test body',
                },
            };
            const response = await request(app).post(`${USER_POST}`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send(body);
            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.userPost.id).toBeGreaterThan(0);
        });
    });

    describe('update', () => {
        test('unauthenticated', async () => {
            const response = await request(app).patch(USER_POST).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app).patch(USER_POST).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .patch(USER_POST)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({
                    userPost: {
                        id: 'invalid',
                    },
                });

            expect(response.status).toEqual(INVALID_REQUEST.httpCode);
        });

        test('does not exist', async () => {
            const response = await request(app)
                .patch(USER_POST)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({
                    userPost: {
                        id: 0,
                    },
                });

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
        });

        test('does not belong to user', async () => {
            const response = await request(app)
                .patch(USER_POST)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN_2}`)
                .send({
                    userPost: {
                        id: TEST_POST_ID,
                    },
                });

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
            expect(response.body.userPost).toBeUndefined();
        });

        test('valid', async () => {
            const randomString = Math.random().toString(36).substring(7);
            const body: UpdateUserPostRequest = {
                userPost: {
                    id: TEST_POST_ID,
                    body: randomString,
                },
            };

            const response = await request(app).patch(USER_POST).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.userPost.body).toEqual(randomString);
        });

        test('can upload image', async () => {
            const randomString = Math.random().toString(36).substring(7);
            const body: UpdateUserPostRequest = {
                userPost: {
                    id: TEST_POST_ID,
                    images: [{ url: randomString }],
                },
            };

            const response = await request(app).patch(USER_POST).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.userPost.images[0].url).toEqual(randomString);
        });
    });

    describe('delete', () => {
        //TODO - convert to endpoint
        test('valid', async () => {
            const body: UpdateUserPostRequest = {
                userPost: {
                    id: TEST_POST_TO_DELETE_ID,
                    active: false,
                },
            };

            const response = await request(app).patch(USER_POST).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send(body);
            expect(response.status).toEqual(SUCCESS.httpCode);

            const deletedPost = await UserPostController.getById(TEST_POST_TO_DELETE_ID);
            expect(deletedPost?.active).toBeFalsy();
        });
    });

    describe('add like', () => {
        test('unauthenticated', async () => {
            const response = await request(app).post(`${USER_POST}id/like`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app).post(`${USER_POST}id/like`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app).post(`${USER_POST}id/like`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(GENERAL_FAILURE.httpCode);
        });

        test('unknown', async () => {
            const response = await request(app).post(`${USER_POST}0/like`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
        });

        test('valid', async () => {
            const response = await request(app).post(`${USER_POST}${TEST_POST_ID}/like`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            const userPost = await UserPostController.getById(TEST_POST_ID);

            expect(userPost?.likes.length).toEqual(1);
            expect(response.status).toEqual(SUCCESS.httpCode);
        });

        test('cannot like twice', async () => {
            await request(app).post(`${USER_POST}${TEST_POST_ID}/like`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();
            const response = await request(app).post(`${USER_POST}${TEST_POST_ID}/like`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            const userPost = await UserPostController.getById(TEST_POST_ID);

            expect(userPost?.likes.length).toEqual(1);
            expect(response.status).toEqual(RESOURCE_ALREADY_EXISTS.httpCode);
        });

        describe('like adds notification', () => {
            const email = 'likeaddnotiuserpost@embtr.com';
            let accountWithUser: TestAccountWithUser;
            let userToken: string;
            let userPostId: number = 0;

            beforeAll(async () => {
                await TestUtility.deleteAccountWithUser(email);
                accountWithUser = await TestUtility.createAccountWithUser(email, 'password', Role.USER);
                userToken = await AuthenticationController.generateValidIdToken(email, 'password');

                userPostId = (await UserPostController.create({ userId: accountWithUser.user.id, body: 'test body' })).id;
            });

            afterAll(async () => {
                await TestUtility.deleteAccountWithUser(email);
            });

            test('like adds notification', async () => {
                await request(app).post(`${USER_POST}${userPostId}/like`).set('Authorization', `Bearer ${userToken}`).send();

                const likes = await NotificationController.getAll(accountWithUser.user.id);
                expect(likes.length).toEqual(1);
            });
        });
    });

    describe('add comment', () => {
        test('unauthenticated', async () => {
            const response = await request(app).post(`${USER_POST}0/comment`).set('Authorization', 'Bearer Trash').send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app).post(`${USER_POST}0/comment`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app).post(`${USER_POST}abc/comment`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send({});

            expect(response.status).toEqual(GENERAL_FAILURE.httpCode);
        });

        test('unknown', async () => {
            const body: CreateCommentRequest = {
                comment: 'comment',
            };

            const response = await request(app).post(`${USER_POST}0/comment`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send(body);

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
        });

        test('valid', async () => {
            const body: CreateCommentRequest = {
                comment: 'comment',
            };

            const response = await request(app)
                .post(`${USER_POST}${TEST_POST_ID}/comment`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });
    });

    describe('delete comment', () => {
        test('unauthenticated', async () => {
            const response = await request(app).delete(`${USER_POST}comment/0`).set('Authorization', 'Bearer Trash').send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
        });

        test('unauthorized', async () => {
            const response = await request(app).delete(`${USER_POST}/comment/0`).set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`).send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app).delete(`${USER_POST}/comment/abc`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(INVALID_REQUEST.httpCode);
        });

        test('unknown', async () => {
            const response = await request(app).delete(`${USER_POST}/comment/0`).set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`).send();

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
        });

        test('valid', async () => {
            const comment = await CommentController.create(Interactable.USER_POST, ACCOUNT_USER_WITH_USER_ROLE.user.id, TEST_POST_ID, 'test comment');
            const response = await request(app)
                .delete(`${USER_POST}comment/${comment.id}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });

        test('wrong user', async () => {
            const comment = await CommentController.create(Interactable.USER_POST, ACCOUNT_USER_WITH_USER_ROLE.user.id, TEST_POST_ID, 'test comment');
            const response = await request(app)
                .delete(`${USER_POST}comment/${comment.id}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN_2}`)
                .send();

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
        });
    });
});
