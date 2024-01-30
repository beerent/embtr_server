import express from 'express';
import userRouterV1 from './UserRouterV1';

const userRouter = express.Router();

userRouter.use('/v1/user', userRouterV1);

//default fallback is always latest
userRouter.use('/:version/user', userRouterV1);

export default userRouter;
