import express from 'express';
import premiumRouterLatest from './PremiumRouterLatest';

const premiumRouter = express.Router();

premiumRouter.use('/:version/premium', premiumRouterLatest);

export default premiumRouter;
