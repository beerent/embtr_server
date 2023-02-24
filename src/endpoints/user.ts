import { GetUserResponse } from '@resources/types';
import { SUCCESS } from '@src/common/RequestResponses';
import { logger } from '@src/common/logger/Logger';
import { authenticate } from '@src/middleware/authentication';
import { authorizeUserGet } from '@src/middleware/user/userAuthorization';
import { UserService } from '@src/service/UserService';
import express from 'express';

const userRouter = express.Router();

userRouter.get('/:uid', authenticate, authorizeUserGet, async (req, res) => {
    const uid = req.params.uid;
    const response: GetUserResponse = await UserService.get(uid);
    logger.info(`GET /user/${uid} response: ${JSON.stringify(response)}`);

    res.status(response.httpCode).json(response);
});

userRouter.post('/', authenticate, async (req, res) => {
    console.log(`POST /user request: ${JSON.stringify(req.body)}`);
    const response = await UserService.create(req);
    console.log(`POST /user response: ${JSON.stringify(response)}`);
    res.status(response.httpCode).json(response);
});

export default userRouter;
