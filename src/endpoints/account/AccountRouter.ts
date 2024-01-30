import express from 'express';
import accountRouterV1 from './AccountRouterV1';

const accountRouter = express.Router();

accountRouter.use('/v1/account', accountRouterV1);

//default fallback is always latest
accountRouter.use('/:version/account', accountRouterV1);

export default accountRouter;
