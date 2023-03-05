import { GetUserResponse, UpdateUserRequest } from '@resources/types';
import { authenticate } from '@src/middleware/authentication';
import { authorizeUserGet, authorizeUserPatch } from '@src/middleware/user/UserAuthorization';
import { UserService } from '@src/service/UserService';
import express from 'express';

const userRouter = express.Router();

userRouter.get('/:uid', authenticate, authorizeUserGet, async (req, res) => {
    const uid = req.params.uid;
    const response: GetUserResponse = await UserService.get(uid);

    res.status(response.httpCode).json(response);
});

userRouter.post('/', authenticate, async (req, res) => {
    const response = await UserService.create(req);
    res.status(response.httpCode).json(response);
});

userRouter.patch('/', authenticate, authorizeUserPatch, async (req, res) => {
    const body: UpdateUserRequest = req.body;
    const response = await UserService.update(req, body);

    res.status(response.httpCode).json(response);
});

export default userRouter;