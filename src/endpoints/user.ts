import { CreateAccountRequest, Response } from '@resources/types';
import { logger } from '@src/common/logger/Logger';
import { authenticate } from '@src/middleware/authentication';
import { AccountService } from '@src/service/AccountService';
import express from 'express';

const userRouter = express.Router();

userRouter.get('/:uid', authenticate, async (req, res) => {
    const uid = req.params.uid;

    const body: CreateAccountRequest = req.body;
    const response: Response = await AccountService.create(body);

    res.status(response.httpCode).json(response);
});

export default userRouter;
