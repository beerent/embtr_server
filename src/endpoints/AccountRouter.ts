import { CreateAccountRequest, ForgotAccountPasswordRequest, VerifyAccountEmailRequest } from '@resources/types/AccountTypes';
import { AuthenticationRequest, AuthenticationResponse } from '@resources/types/RequestTypes';
import { Response } from '@resources/types/RequestTypes';
import { AccountService } from '@src/service/AccountService';
import express from 'express';

const accountRouter = express.Router();

accountRouter.post('/create', async (req, res) => {
    const body: CreateAccountRequest = req.body;
    const response: Response = await AccountService.create(body);

    res.status(response.httpCode).json(response);
});

accountRouter.post('/forgot_password', async (req, res) => {
    const body: ForgotAccountPasswordRequest = req.body;
    const response: Response = await AccountService.forgotPassword(body);

    res.status(response.httpCode).json(response);
});

accountRouter.post('/send_verification_email', async (req, res) => {
    const body: VerifyAccountEmailRequest = req.body;
    const response: Response = await AccountService.sendVerificationEmail(body);

    res.status(response.httpCode).json(response);
});

accountRouter.post('/authenticate', async (req, res) => {
    const body: AuthenticationRequest = req.body;
    const response: AuthenticationResponse = await AccountService.authenticate(body);

    res.status(response.httpCode).json(response);
});

export default accountRouter;
