import express from 'express';
import userRouterV3 from './UserRouterV3';
import userRouterLatest from './UserRouterLatest';

const userRouter = express.Router();

const versionRanges = [{ min: 1, max: 3 }];
versionRanges.forEach((range) => {
    for (let i = range.min; i <= range.max; i++) {
        userRouter.use(`/v${i}/user`, userRouterV3);
    }
});

userRouter.use('/:version/user', userRouterLatest);

export default userRouter;
