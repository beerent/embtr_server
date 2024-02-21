import express from 'express';
import accountRouterLatest from './AccountRouterLatest';

const accountRouter = express.Router();

accountRouter.use('/:version/account', accountRouterLatest);

export default accountRouter;
