import { USER_POST } from '@resources/endpoints';
import app from '@src/app';
import { FORBIDDEN, INVALID_REQUEST, RESOURCE_NOT_FOUND, UNAUTHORIZED } from '@src/common/RequestResponses';
import { AuthenticationController } from '@src/controller/AuthenticationController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('get by id', () => {
    const ACCOUNT_WITH_NO_ROLES = 'pds_account_no_roles@embtr.com';
    let ACCOUNT_WITH_NO_ROLES_TOKEN: string;

    const ACCOUNT_WITH_USER_ROLE = 'pds_account_user_role@embtr.com';
    let ACCOUNT_WITH_USER_ROLE_TOKEN: string;
    let ACCOUNT_USER_WITH_USER_ROLE: TestAccountWithUser;

    beforeAll(async () => {
        //user deletes
        const deletes = [TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES), TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE)];
        await Promise.all(deletes);

        //user creates
        const creates = [
            TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER),
        ];
        const [account1, account2] = await Promise.all(creates);
        ACCOUNT_USER_WITH_USER_ROLE = account2;

        //user authenticates
        const authenticates = [
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_NO_ROLES, 'password'),
            AuthenticationController.generateValidIdToken(ACCOUNT_WITH_USER_ROLE, 'password'),
        ];
        const [token1, token2] = await Promise.all(authenticates);
        ACCOUNT_WITH_NO_ROLES_TOKEN = token1;
        ACCOUNT_WITH_USER_ROLE_TOKEN = token2;
    });

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

    //test('valid', async () => {
    //    const response = await request(app)
    //        .get(`${USER_POST}${TEST_EXISTING_PLANNED_DAY_RESULT_ID}`)
    //        .set('Authorization', `Bearer ${ACCOUNT_WITH_USER_ROLE_TOKEN}`)
    //        .send();

    //            expect(response.status).toEqual(SUCCESS.httpCode);
    //            const responseObject: GetPlannedDayResultResponse = response.body;
    //            expect(responseObject!.plannedDayResult!.id).toEqual(TEST_EXISTING_PLANNED_DAY_RESULT_ID);
    //        });
});
