import express from 'express';
import MarketingRouterV1 from '@src/endpoints/marketing/MarketingRouterV1';

const marketingRouter = express.Router();

marketingRouter.use('/v1/mail-list', MarketingRouterV1);

//default fallback is always latest
marketingRouter.use('/:version/mail-list', MarketingRouterV1);

export default marketingRouter;
