import express from 'express';
import MarketingRouterV1 from '@src/endpoints/marketing/MarketingRouterV1';
import app from '@src/app';

const healthRouter = express.Router();

healthRouter.use('/:version/health', (req, res) => res.send('OK'));
healthRouter.use('/health', (req, res) => res.send('OK'));

export default healthRouter;
