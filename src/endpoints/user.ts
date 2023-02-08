import express, { Request, Response } from 'express';
import { UserController } from 'src/auth/UserController';
import { RequestResponse } from 'src/common/RequestResponses';

const userRouter = express.Router();

userRouter.post('/create', async (req, res) => {
    const body = req.body;
    const response: RequestResponse = await UserController.createUser(body.email, body.password);

    res.status(response.code).json(response);
});

export default userRouter;
