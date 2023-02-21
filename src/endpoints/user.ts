import { GetUserResponse } from '@resources/types';
import { authenticate } from '@src/middleware/authentication';
import { authorizeUserGet } from '@src/middleware/user/userAuthorization';
import { UserService } from '@src/service/UserService';
import express from 'express';

const userRouter = express.Router();

userRouter.get('/:uid', authenticate, authorizeUserGet, async (req, res) => {
    const uid = req.params.uid;
    const response: GetUserResponse = await UserService.get(uid);

    res.status(response.httpCode).json(response);
});

export default userRouter;
