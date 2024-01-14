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

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3000, // limit each IP to 100 requests per windowMs
    onLimitReached: (req, res, options) => {
        res.status(429).end('Too many requests, please try again later.');
    },
});

const accountRouter = express.Router();

accountRouter.post(
    ['/create', '/v1/create'],
    runEndpoint(async (req, res) => {
        const body: CreateAccountRequest = req.body;
        const response: Response = await AccountService.create(body);

        res.status(response.httpCode).json(response);
    })
);

accountRouter.use('/forgot_password', limiter);
accountRouter.post(
    ['/forgot_password', '/v1/forgot_password'],
    runEndpoint(async (req, res) => {
        const body: ForgotAccountPasswordRequest = req.body;
        const response: Response = await AccountService.forgotPassword(body);

        res.status(response.httpCode).json(response);
    })
);

accountRouter.post(
    ['/send_verification_email', '/v1/send_verification_email'],
    runEndpoint(async (req, res) => {
        const body: VerifyAccountEmailRequest = req.body;
        const response: Response = await AccountService.sendVerificationEmail(body);

        res.status(response.httpCode).json(response);
    })
);

accountRouter.post(
    ['/authenticate', '/v1/authenticate'],
    runEndpoint(async (req, res) => {
        const body: AuthenticationRequest = req.body;
        const response: AuthenticationResponse = await AccountService.authenticate(body);

        res.status(response.httpCode).json(response);
    })
);

accountRouter.post(
    ['/refresh_token', '/v1/refresh_token'],
    runEndpoint(async (req, res) => {
        const response: AuthenticationResponse = await AccountService.refreshToken(req);
        res.status(response.httpCode).json(response);
    })
);

accountRouter.post(
    ['/delete', '/v1/delete'],
    authenticate,
    runEndpoint(async (req, res) => {
        const response: Response = await AccountService.delete(req);
        res.status(response.httpCode).json(response);
    })
);

export default accountRouter;
