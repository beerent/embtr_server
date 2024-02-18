import express from 'express';
import userPostRouterLatest from './UserPostRouterLatest';

const userPostRouter = express.Router();

userPostRouter.use('/:version/user-post', userPostRouterLatest);

export default userPostRouter;
