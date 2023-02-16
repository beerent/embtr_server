import { CreateUserRequest, ForgotPasswordRequest, Response, VerifyEmailRequest } from '@resources/types';
import { logger } from '@src/common/logger/Logger';
import { UserService } from '@src/service/UserService';
import express from 'express';

const userRouter = express.Router();

userRouter.post('/create', async (req, res) => {
    logger.info('POST request /user/create', req.body);
    const body: CreateUserRequest = req.body;
    const response: Response = await UserService.create(body);
    logger.info('POST response /user/create', response);

    res.status(response.httpCode).json(response);
});

userRouter.post('/forgot_password', async (req, res) => {
    logger.info('POST request /user/forgot_password', req.body);
    const body: ForgotPasswordRequest = req.body;
    const response: Response = await UserService.forgotPassword(body);
    logger.info('POST response /user/forgot_password', response);

    res.status(response.httpCode).json(response);
});

userRouter.post('/send_verification_email', async (req, res) => {
    logger.info('POST request /user/send_verification_email', req.body);
    const body: VerifyEmailRequest = req.body;
    const response: Response = await UserService.sendVerificationEmail(body);
    logger.info('POST response /user/send_verification_email', response);

    res.status(response.httpCode).json(response);
});

export default userRouter;
