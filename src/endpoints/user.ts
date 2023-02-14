import { CreateUserRequest, ForgotPasswordRequest, Response } from '@resources/types';
import { UserController } from '@src/auth/UserController';
import { logger } from '@src/common/logger/Logger';
import express from 'express';

const userRouter = express.Router();

userRouter.post('/create', async (req, res) => {
    logger.info('POST request /user/create', req.body);
    const body: CreateUserRequest = req.body;
    const response: Response = await UserController.createUser(body);
    logger.info('POST response /user/create', response);

    res.status(response.httpCode).json(response);
});

userRouter.post('/forgot_password', async (req, res) => {
    logger.info('POST request /user/forgot_password', req.body);
    const body: ForgotPasswordRequest = req.body;
    const response: Response = await UserController.forgotPassword(body);
    logger.info('POST response /user/forgot_password', response);

    res.status(response.httpCode).json(response);
});

export default userRouter;
