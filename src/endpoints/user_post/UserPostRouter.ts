import express from 'express';
import userPostRouterV1 from '@src/endpoints/user_post/UserPostRouterV1';

const userPostRouter = express.Router();

userPostRouter.use('/v1/user-post', userPostRouterV1);

//default fallback is always latest
userPostRouter.use('/:version/user-post', userPostRouterV1);

export default userPostRouter;
