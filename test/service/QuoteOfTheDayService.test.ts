import { CreateQuoteOfTheDayResponse } from '@resources/types/requests/QuoteOfTheDayTypes';
import app from '@src/app';
import {
    FORBIDDEN,
    GENERAL_FAILURE,
    INVALID_REQUEST,
    SUCCESS,
    UNAUTHORIZED,
} from '@src/common/RequestResponses';
import { MetadataController } from '@src/controller/MetadataController';
import { QuoteOfTheDayController } from '@src/controller/QuoteOfTheDayController';
import { Role } from '@src/roles/Roles';
import { TestAccountWithUser, TestUtility } from '@test/test_utility/TestUtility';
import request from 'supertest';

describe('QuoteOfTheDayService', () => {
    const ACCOUNT_WITH_NO_ROLES = 'qotdw_account_no_roles@embtr.com';
    let USER_ACCOUNT_WITH_NO_ROLES: TestAccountWithUser;

    const ACCOUNT_WITH_USER_ROLE = 'qotdw_account_user_role@embtr.com';
    let USER_ACCOUNT_WITH_USER_ROLE: TestAccountWithUser;

    beforeAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
        ];
        await Promise.all(deletes);

        const creates = [
            TestUtility.createAccountWithUser(ACCOUNT_WITH_NO_ROLES, 'password', Role.INVALID),
            TestUtility.createAccountWithUser(ACCOUNT_WITH_USER_ROLE, 'password', Role.USER),
        ];
        const [noRoleUser, userRoleUser] = await Promise.all(creates);
        USER_ACCOUNT_WITH_NO_ROLES = noRoleUser;
        USER_ACCOUNT_WITH_USER_ROLE = userRoleUser;
    });

    afterAll(async () => {
        const deletes = [
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_NO_ROLES),
            TestUtility.deleteAccountWithUser(ACCOUNT_WITH_USER_ROLE),
        ];
        await Promise.all(deletes);
    });

    describe('add', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .post('/quote-of-the-day')
                .set('Authorization', 'Bearer Trash')
                .send({});
            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .post('/quote-of-the-day')
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send({});

            expect(response.status).toEqual(FORBIDDEN.httpCode);
        });

        test('invalid request', async () => {
            const response = await request(app)
                .post('/quote-of-the-day')
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send({});

            expect(response.status).toEqual(INVALID_REQUEST.httpCode);
        });

        test('success', async () => {
            const response = await request(app)
                .post('/quote-of-the-day')
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send({ quote: 'test quote' });

            const responseBody = response.body as CreateQuoteOfTheDayResponse;

            expect(response.status).toEqual(SUCCESS.httpCode);
            expect(responseBody.quoteOfTheDay?.quote).toEqual('test quote');
            expect(responseBody.quoteOfTheDay?.id).toBeDefined();
        });
    });

    describe('get', () => {
        test('unauthenticated', async () => {
            const response = await request(app)
                .get('/quote-of-the-day')
                .set('Authorization', 'Bearer Trash')
                .send();
            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .get('/quote-of-the-day')
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
        });

        test('no quote of the day', async () => {
            const response = await request(app)
                .get('/quote-of-the-day')
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            expect(response.status).toEqual(GENERAL_FAILURE.httpCode);
        });

        describe('success', () => {
            const quote = 'automated test quote of the day';

            beforeAll(async () => {
                const createdQuote = await QuoteOfTheDayController.add(
                    USER_ACCOUNT_WITH_USER_ROLE.user.id,
                    quote,
                    undefined
                );
                await MetadataController.set('QUOTE_OF_THE_DAY', createdQuote.id.toString());
            });

            afterAll(async () => {
                await QuoteOfTheDayController.deleteByQuote(quote);
                await MetadataController.delete('QUOTE_OF_THE_DAY');
            });

            test('success', async () => {
                const response = await request(app)
                    .get('/quote-of-the-day')
                    .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                    .send();

                expect(response.status).toEqual(SUCCESS.httpCode);
                expect(response.body.quoteOfTheDay?.quote).toEqual(
                    'automated test quote of the day'
                );
            });
        });
    });

    describe('like', () => {
        const quote = 'automated test quote of the day to like';
        let id: string;
        beforeAll(async () => {
            const createdQuote = await QuoteOfTheDayController.add(
                USER_ACCOUNT_WITH_USER_ROLE.user.id,
                quote,
                undefined
            );
            id = createdQuote.id.toString();
            await MetadataController.set('QUOTE_OF_THE_DAY', createdQuote.id.toString());
        });

        afterAll(async () => {
            await MetadataController.delete('QUOTE_OF_THE_DAY');
        });

        test('unauthenticated', async () => {
            const response = await request(app)
                .post(`/quote-of-the-day/${id}/like`)
                .set('Authorization', 'Bearer Trash')
                .send();

            expect(response.status).toEqual(UNAUTHORIZED.httpCode);
        });

        test('unauthorized', async () => {
            const response = await request(app)
                .post(`/quote-of-the-day/${id}/like`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_NO_ROLES.token}`)
                .send();

            expect(response.status).toEqual(FORBIDDEN.httpCode);
        });

        test('success', async () => {
            const response = await request(app)
                .post(`/quote-of-the-day/${id}/like`)
                .set('Authorization', `Bearer ${USER_ACCOUNT_WITH_USER_ROLE.token}`)
                .send();

            expect(response.status).toEqual(SUCCESS.httpCode);
        });
    });
});
