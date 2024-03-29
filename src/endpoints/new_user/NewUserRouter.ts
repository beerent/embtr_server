import express from 'express';
import newUserRouterLatest from './NewUserRouterLatest';

const newUserRouter = express.Router();

newUserRouter.use('/:version/new-user', newUserRouterLatest);

export default newUserRouter;
