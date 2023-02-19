import { CreateAccountRequest, ForgotAccountPasswordRequest, Response, VerifyAccountEmailRequest } from '@resources/types';
import { logger } from '@src/common/logger/Logger';
import { AccountService } from '@src/service/AccountService';
import express from 'express';

const accountRouter = express.Router();

accountRouter.post('/create', async (req, res) => {
    logger.info('POST request /account/create', req.body);
    const body: CreateAccountRequest = req.body;
    const response: Response = await AccountService.create(body);
    logger.info('POST response /account/create', response);

    res.status(response.httpCode).json(response);
});

accountRouter.post('/forgot_password', async (req, res) => {
    logger.info('POST request /account/forgot_password', req.body);
    const body: ForgotAccountPasswordRequest = req.body;
    const response: Response = await AccountService.forgotPassword(body);
    logger.info('POST response /account/forgot_password', response);

    res.status(response.httpCode).json(response);
});

accountRouter.post('/send_verification_email', async (req, res) => {
    logger.info('POST request /account/send_verification_email', req.body);
    const body: VerifyAccountEmailRequest = req.body;
    const response: Response = await AccountService.sendVerificationEmail(body);
    logger.info('POST response /account/send_verification_email', response);

    res.status(response.httpCode).json(response);
});

export default accountRouter;
