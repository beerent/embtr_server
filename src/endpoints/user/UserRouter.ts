import express from 'express';
import userRouterLatest from './UserRouterLatest';

const userRouter = express.Router();

userRouter.use('/:version/user', userRouterLatest);

export default userRouter;
