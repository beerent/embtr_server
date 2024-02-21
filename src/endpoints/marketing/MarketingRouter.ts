import express from 'express';
import marketingRouterLatest from './MarketingRouterLatest';

const marketingRouter = express.Router();

marketingRouter.use('/:version/mail-list', marketingRouterLatest);

export default marketingRouter;
