import {
    CreateAccountRequest,
    ForgotAccountPasswordRequest,
    VerifyAccountEmailRequest,
} from '@resources/types/requests/AccountTypes';
import {
    AuthenticationRequest,
    AuthenticationResponse,
} from '@resources/types/requests/RequestTypes';
import { Response } from '@resources/types/requests/RequestTypes';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { AccountService } from '@src/service/AccountService';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '@src/middleware/authentication';
import { ContextService } from '@src/service/ContextService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3000, // limit each IP to 100 requests per windowMs
    onLimitReached: (req, res, options) => {
        res.status(429).end('Too many requests, please try again later.');
    },
});

const accountRouterLatest = express.Router();
const v = '✓';

accountRouterLatest.post(
    '/create',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const body: CreateAccountRequest = req.body;
        const response: Response = await AccountService.create(body);

        res.status(response.httpCode).json(response);
    })
);

accountRouterLatest.use('/forgot_password', limiter);
accountRouterLatest.post(
    '/forgot_password',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const body: ForgotAccountPasswordRequest = req.body;
        const response: Response = await AccountService.forgotPassword(body);

        res.status(response.httpCode).json(response);
    })
);

accountRouterLatest.post(
    '/send_verification_email',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const body: VerifyAccountEmailRequest = req.body;
        const response: Response = await AccountService.sendVerificationEmail(body);

        res.status(response.httpCode).json(response);
    })
);

accountRouterLatest.post(
    '/authenticate',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const body: AuthenticationRequest = req.body;
        const response: AuthenticationResponse = await AccountService.authenticate(body);

        res.status(response.httpCode).json(response);
    })
);

accountRouterLatest.post(
    '/refresh_token',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const response: AuthenticationResponse = await AccountService.refreshToken(req);
        res.status(response.httpCode).json(response);
    })
);

accountRouterLatest.post(
    '/delete',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const response: Response = await AccountService.delete(context);
        res.status(response.httpCode).json(response);
    })
);

export default accountRouterLatest;
