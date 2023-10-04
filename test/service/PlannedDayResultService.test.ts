import { PLANNED_DAY_RESULT } from '@resources/endpoints';
import { PlannedDay } from '@resources/schema';
import { Interactable } from '@resources/types/interactable/Interactable';
import { CreateCommentRequest } from '@resources/types/requests/GeneralTypes';
import {
    GetPlannedDayResultResponse,
    GetPlannedDayResultsResponse,
    UpdatePlannedDayResultRequest,
} from '@resources/types/requests/PlannedDayResultTypes';
import app from '@src/app';
import {
    CREATE_DAY_RESULT_FAILED,
    CREATE_DAY_RESULT_INVALID,
    CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID,
    CREATE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN,
    DELETE_PLANNED_DAY_RESULT_COMMENT_INVALID,
    DELETE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN,
    FORBIDDEN,
    GENERAL_FAILURE,
    GET_DAY_RESULTS_SUCCESS,
    GET_DAY_RESULT_INVALID,
    GET_DAY_RESULT_SUCCESS,
    GET_DAY_RESULT_UNKNOWN,
    INVALID_REQUEST,
    RESOURCE_ALREADY_EXISTS,
    RESOURCE_NOT_FOUND,
    SUCCESS,
    UNAUTHORIZED,
    UPDATE_PLANNED_DAY_RESULT_INVALID,
    UPDATE_PLANNED_DAY_RESULT_UNKNOWN,
} from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { NotificationController } from '@src/controller/NotificationController';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';
import { PlannedHabitController } from '@src/controller/PlannedTaskController';
import { TaskController } from '@src/controller/TaskController';
import { CommentController } from '@src/controller/common/CommentController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('DayResultServices', () => {
    const ACCOUNT_WITH_NO_ROLES = 'drs_account_no_roles@embtr.com';
    let ACCOUNT_WITH_NO_ROLES_TOKEN: string;

    const ACCOUNT_WITH_USER_ROLE = 'drs_account_user_roles@embtr.com';
    let ACCOUNT_WITH_USER_ROLE_TOKEN: string;
    let ACCOUNT_USER_WITH_USER_ROLE: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE_2 = 'drs_account_user_roles_2@embtr.com';
    let ACCOUNT_WITH_USER_ROLE_2_TOKEN: string;

    const TEST_PLANNED_DAY_DATE_TO_CREATE_RESULT = '0100-01-02';
    let TEST_PLANNED_DAY_TO_CREATE_RESULT_ID: number;

    const TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT = '0100-01-01';
    const TEST_TASK_TITLE = 'DRS Test Task';
    let TEST_EXISTING_PLANNED_DAY_RESULT_ID: number;

    const TEST_PLANNED_DAY_DATE_TO_COMMENT = '0100-01-03';
    let TEST_EXISTING_PLANNED_DAY_RESULT_TO_COMMENT_ID: number;

    const TEST_PLANNED_DAY_DIFFERENT_USER = '0100-01-04';
    let TEST_EXISTING_PLANNED_DAY_RESULT_COMMENT_TO_DELETE_ID: number;

    let TEST_PLANNED_DAY_TO_DELETE_ID: number;

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

        //user authenticates
        const authenticates = [
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password'),
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password'),
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE_2, 'password'),
        ];
        const [token1, token2, token3] = await Promise.all(authenticates);
        ACCOUNT_WITH_NO_ROLES_TOKEN = token1;
        ACCOUNT_WITH_USER_ROLE_TOKEN = token2;
        ACCOUNT_WITH_USER_ROLE_2_TOKEN = token3;

        //planned days
        const plannedDayCreates = [
            PlannedDayController.create(
                ACCOUNT_USER_WITH_USER_ROLE.user.id,
                TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT
            ),
            PlannedDayController.create(
                ACCOUNT_USER_WITH_USER_ROLE.user.id,
                TEST_PLANNED_DAY_DATE_TO_CREATE_RESULT
            ),
            PlannedDayController.create(
                ACCOUNT_USER_WITH_USER_ROLE.user.id,
                TEST_PLANNED_DAY_DATE_TO_COMMENT
            ),
            PlannedDayController.create(
                ACCOUNT_USER_WITH_USER_ROLE.user.id,
                TEST_PLANNED_DAY_DIFFERENT_USER
            ),
        ];
        const [plannedDay, plannedDayToCreateResult, plannedDayToComment, plannedDayDifferentUser] =
            await Promise.all(plannedDayCreates);
        TEST_PLANNED_DAY_TO_CREATE_RESULT_ID = plannedDayToCreateResult.id;

        //tasks
        await TaskController.deleteByTitle(TEST_TASK_TITLE);
        const task = await TaskController.create(TEST_TASK_TITLE);
        await PlannedHabitController.create(plannedDay, task!);

        const plannedDayResultCreates = [
            PlannedDayResultController.create(plannedDay.id),
            PlannedDayResultController.create(plannedDayToComment.id),
            PlannedDayResultController.create(plannedDayDifferentUser.id),
        ];
        const [dayResult, dayResultToComment] = await Promise.all(plannedDayResultCreates);

        TEST_EXISTING_PLANNED_DAY_RESULT_ID = dayResult.id;
        TEST_EXISTING_PLANNED_DAY_RESULT_TO_COMMENT_ID = dayResultToComment.id;

        const comment = await CommentController.create(
            Interactable.PLANNED_DAY_RESULT,
            ACCOUNT_USER_WITH_USER_ROLE.user.id,
            TEST_EXISTING_PLANNED_DAY_RESULT_TO_COMMENT_ID,
            'Test Comment To Delete'
        );
        TEST_EXISTING_PLANNED_DAY_RESULT_COMMENT_TO_DELETE_ID = comment!.id;
    });

    afterAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE_2),
        ];
        await Promise.all(deletes);

        await TaskController.deleteByTitle(TEST_TASK_TITLE);
    });

    describe('get by id', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}id`)
                .set('Authorization', 'Bearer Trash')
                .send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}id`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}invalid`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({});

            expect(response.status).toEqual(GET_DAY_RESULT_INVALID.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('non-existing day result', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}0`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({});

            expect(response.status).toEqual(GET_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${TEST_EXISTING_PLANNED_DAY_RESULT_ID}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GET_DAY_RESULT_SUCCESS.httpCode);
            const responseObject: GetPlannedDayResultResponse = response.body;
            expect(responseObject!.plannedDayResult!.id).toEqual(
                TEST_EXISTING_PLANNED_DAY_RESULT_ID
            );
        });
    });

    describe('get by user and dayKey', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get(
                    `${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT}`
                )
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get(
                    `${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT}`
                )
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/a}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GET_DAY_RESULT_INVALID.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('non-existing day result', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/3000-01-01}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GET_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app)
                .get(
                    `${PLANNED_DAY_RESULT}${ACCOUNT_USER_WITH_USER_ROLE.user.id}/${TEST_PLANNED_DAY_DATE_FOR_PRECREATED_RESULT}`
                )
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GET_DAY_RESULT_SUCCESS.httpCode);
            const responseObject: GetPlannedDayResultResponse = response.body;
            expect(responseObject!.plannedDayResult!.id).toEqual(
                TEST_EXISTING_PLANNED_DAY_RESULT_ID
            );
        });
    });

    describe('get all', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get(`${PLANNED_DAY_RESULT}`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        describe('with bounds', () => {
            beforeAll(async () => {
                const creates = [
                    PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, '2020-01-01'),
                    PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, '2020-01-02'),
                    PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, '2020-01-03'),
                    PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, '2020-01-04'),
                    PlannedDayController.create(ACCOUNT_USER_WITH_USER_ROLE.user.id, '2020-01-05'),
                ];
                const [p1, p2, p3, p4, p5] = await Promise.all(creates);

                const plannedDayResultCreates = [
                    PlannedDayResultController.create(p1.id),
                    PlannedDayResultController.create(p2.id),
                    PlannedDayResultController.create(p3.id),
                    PlannedDayResultController.create(p4.id),
                    PlannedDayResultController.create(p5.id),
                ];
                const [pdr1, pdr2, pdr3, pdr4, pdr5] = await Promise.all(plannedDayResultCreates);

                const updates = [
                    PlannedDayResultController.update({
                        id: pdr1.id,
                        createdAt: new Date('2020-01-01'),
                    }),
                    PlannedDayResultController.update({
                        id: pdr2.id,
                        createdAt: new Date('2020-01-02'),
                    }),
                    PlannedDayResultController.update({
                        id: pdr3.id,
                        createdAt: new Date('2020-01-03'),
                    }),
                    PlannedDayResultController.update({
                        id: pdr4.id,
                        createdAt: new Date('2020-01-04'),
                    }),
                    PlannedDayResultController.update({
                        id: pdr5.id,
                        createdAt: new Date('2020-01-05'),
                    }),
                ];
                await Promise.all(updates);
            });

            test('skips data outside of bounds', async () => {
                const response = await request(app)
                    .get(
                        `${PLANNED_DAY_RESULT}?lowerBound=${new Date(
                            '2020-01-02'
                        ).toISOString()}&upperBound=${new Date('2020-01-04').toISOString()}`
                    )
                    .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                    .send();

                expect(response.status).toEqual(GET_DAY_RESULTS_SUCCESS.httpCode);
                const responseObject: GetPlannedDayResultsResponse = response.body;
                expect(responseObject!.plannedDayResults!.length).toEqual(3);
            });

            test('include all data inside bounds', async () => {
                const response = await request(app)
                    .get(
                        `${PLANNED_DAY_RESULT}?lowerBound=${new Date(
                            '2019-12-31'
                        ).toISOString()}&upperBound=${new Date('2020-01-06').toISOString()}`
                    )
                    .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                    .send();

                expect(response.status).toEqual(GET_DAY_RESULTS_SUCCESS.httpCode);
                const responseObject: GetPlannedDayResultsResponse = response.body;
                expect(responseObject!.plannedDayResults!.length).toEqual(5);
            });
        });
    });

    describe('get all for user', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get(`/user/abc/day-results`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get(`/user/abc/day-results`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body.dayResult).toBeUndefined();
        });

        test('invalid', async () => {
            const response = await request(app)
                .get(`/user/abc/day-results`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(INVALID_REQUEST.httpCode);
            expect(response.body.userPosts).toBeUndefined();
        });

        test('unknown user', async () => {
            const response = await request(app)
                .get(`/user/0/day-results`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
            expect(response.body.userPosts).toBeUndefined();
        });

        test('valid', async () => {
            const response = await request(app)
                .get(`/user/${ACCOUNT_USER_WITH_USER_ROLE.user.id}/day-results`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(SUCCESS.httpCode);
            const responseObject: GetPlannedDayResultsResponse = response.body;
            expect(responseObject?.plannedDayResults?.length).toBeGreaterThan(0);
        });

        test('does not contain other users', async () => {
            const response = await request(app)
                .get(`/user/${ACCOUNT_USER_WITH_USER_ROLE.user.id}/day-results`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(SUCCESS.httpCode);
            const responseObject: GetPlannedDayResultsResponse = response.body;
            expect(responseObject?.plannedDayResults?.length).toBeGreaterThan(0);
            responseObject.plannedDayResults?.forEach((plannedDayResult) => {
                expect(plannedDayResult.plannedDay?.userId).toEqual(
                    ACCOUNT_USER_WITH_USER_ROLE.user.id
                );
            });
        });
    });

    describe('create', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', 'Bearer Trash')
                .send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({ plannedDayId: 'invalid' });

            expect(response.status).toEqual(CREATE_DAY_RESULT_INVALID.httpCode);
            expect(response.body).toEqual(CREATE_DAY_RESULT_INVALID);
        });

        test('does not exist', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({ plannedDayId: 0 });

            expect(response.status).toEqual(CREATE_DAY_RESULT_FAILED.httpCode);
            expect(response.body).toEqual(CREATE_DAY_RESULT_FAILED);
        });

        test('plannedDay does not belong to user', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_2_TOKEN}`)
                .send({ plannedDayId: TEST_PLANNED_DAY_TO_CREATE_RESULT_ID });

            expect(response.status).toEqual(CREATE_DAY_RESULT_FAILED.httpCode);
            expect(response.body).toEqual(CREATE_DAY_RESULT_FAILED);
        });

        test('valid', async () => {
            const response = await request(app)
                .post(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({ plannedDayId: TEST_PLANNED_DAY_TO_CREATE_RESULT_ID });

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.plannedDayResult).toBeDefined();
        });
    });

    describe('update', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', 'Bearer Trash')
                .send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({
                    plannedDayResult: {
                        id: 'invalid',
                    },
                });

            expect(response.status).toEqual(UPDATE_PLANNED_DAY_RESULT_INVALID.httpCode);
            expect(response.body).toEqual(UPDATE_PLANNED_DAY_RESULT_INVALID);
        });

        test('does not exist', async () => {
            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({
                    plannedDayResult: {
                        id: 0,
                    },
                });

            expect(response.status).toEqual(UPDATE_PLANNED_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body).toEqual(UPDATE_PLANNED_DAY_RESULT_UNKNOWN);
        });

        test('does not belong to user', async () => {
            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_2_TOKEN}`)
                .send({
                    plannedDayResult: {
                        id: TEST_EXISTING_PLANNED_DAY_RESULT_ID,
                    },
                });

            expect(response.status).toEqual(UPDATE_PLANNED_DAY_RESULT_UNKNOWN.httpCode);
            expect(response.body).toEqual(UPDATE_PLANNED_DAY_RESULT_UNKNOWN);
        });

        test('valid', async () => {
            const randomString = Math.random().toString(36).substring(7);
            const body: UpdatePlannedDayResultRequest = {
                plannedDayResult: {
                    id: TEST_EXISTING_PLANNED_DAY_RESULT_ID,
                    description: randomString,
                },
            };

            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.plannedDayResult).toBeDefined();
            expect(response.body.plannedDayResult.description).toEqual(randomString);
        });

        test('can upload image', async () => {
            const randomString = Math.random().toString(36).substring(7);
            const body: UpdatePlannedDayResultRequest = {
                plannedDayResult: {
                    id: TEST_EXISTING_PLANNED_DAY_RESULT_ID,
                    description: randomString,
                },
            };

            const response = await request(app)
                .patch(PLANNED_DAY_RESULT)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body.plannedDayResult).toBeDefined();
            expect(response.body.plannedDayResult.description).toEqual(randomString);
        });
    });

    describe('add comment', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}0/comment`)
                .set('Authorization', 'Bearer Trash')
                .send({});

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}0/comment`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}abc/comment`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send({});

            expect(response.status).toEqual(CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID.httpCode);
        });

        test('unknown', async () => {
            const body: CreateCommentRequest = {
                comment: 'comment',
            };

            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}0/comment`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send(body);

            expect(response.status).toEqual(CREATE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN.httpCode);
        });

        test('valid', async () => {
            const body: CreateCommentRequest = {
                comment: 'comment',
            };

            const response = await request(app)
                .post(
                    `${PLANNED_DAY_RESULT}${TEST_EXISTING_PLANNED_DAY_RESULT_TO_COMMENT_ID}/comment`
                )
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send(body);

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });
    });

    describe('delete comment', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .delete(`${PLANNED_DAY_RESULT}comment/0`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .delete(`${PLANNED_DAY_RESULT}/comment/0`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .delete(`${PLANNED_DAY_RESULT}/comment/abc`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(DELETE_PLANNED_DAY_RESULT_COMMENT_INVALID.httpCode);
        });

        test('unknown', async () => {
            const response = await request(app)
                .delete(`${PLANNED_DAY_RESULT}/comment/0`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(DELETE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN.httpCode);
        });

        test('wrong user', async () => {
            const response = await request(app)
                .delete(
                    `${PLANNED_DAY_RESULT}comment/${TEST_EXISTING_PLANNED_DAY_RESULT_COMMENT_TO_DELETE_ID}`
                )
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_2_TOKEN}`)
                .send();

            expect(response.status).toEqual(DELETE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN.httpCode);
        });

        test('valid', async () => {
            const response = await request(app)
                .delete(
                    `${PLANNED_DAY_RESULT}comment/${TEST_EXISTING_PLANNED_DAY_RESULT_COMMENT_TO_DELETE_ID}`
                )
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(response.body).toEqual(SUCCESS);
        });
    });

    describe('add like', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}id/like`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
            expect(response.body).toEqual(UNAUTHORIZED);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}id/like`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_NO_ROLES_TOKEN}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
            expect(response.body).toEqual(FORBIDDEN);
        });

        test('invalid', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}id/like`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(GENERAL_FAILURE.httpCode);
            expect(response.body.message).toEqual('invalid like request');
        });

        test('unknown', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}0/like`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            expect(response.status).toEqual(RESOURCE_NOT_FOUND.httpCode);
        });

        test('valid', async () => {
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}${TEST_EXISTING_PLANNED_DAY_RESULT_TO_COMMENT_ID}/like`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            const plannedDayResult = await PlannedDayResultController.getById(
                TEST_EXISTING_PLANNED_DAY_RESULT_TO_COMMENT_ID
            );

            expect(plannedDayResult?.likes.length).toEqual(1);
            expect(response.status).toEqual(SUCCESS.httpCode);
        });

        test('cannot like twice', async () => {
            await request(app)
                .post(`${PLANNED_DAY_RESULT}${TEST_EXISTING_PLANNED_DAY_RESULT_ID}/like`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();
            const response = await request(app)
                .post(`${PLANNED_DAY_RESULT}${TEST_EXISTING_PLANNED_DAY_RESULT_ID}/like`)
                .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
                .send();

            const plannedDayResult = await PlannedDayResultController.getById(
                TEST_EXISTING_PLANNED_DAY_RESULT_ID
            );

            expect(plannedDayResult?.likes.length).toEqual(1);
            expect(response.status).toEqual(RESOURCE_ALREADY_EXISTS.httpCode);
        });

        describe('like adds notification ', () => {
            const email = 'likeaddnotification@embtr.com';
            let accountWithUser: TestAccountWithUser;
            let userToken: string;
            let plannedDayResultId: number = 0;

            beforeAll(async () => {
                await TestUtility.deleteAccountWithUser(email);
                accountWithUser = await TestUtility.createAccountWithUser(
                    email,
                    'password',
                    Role.USER
                );
                userToken = await AuthenticationController.generateValidIdToken(email, 'password');
                const plannedDay = await PlannedDayController.create(
                    accountWithUser.user.id,
                    '2020-01-01'
                );
                plannedDayResultId = (await PlannedDayResultController.create(plannedDay.id)).id;
            });

            afterAll(async () => {
                await TestUtility.deleteAccountWithUser(email);
            });

            test('like adds notification', async () => {
                await request(app)
                    .post(`${PLANNED_DAY_RESULT}${plannedDayResultId}/like`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send();

                const likes = await NotificationController.getAll(accountWithUser.user.id);
                expect(likes.length).toEqual(1);
            });
        });
    });
});
