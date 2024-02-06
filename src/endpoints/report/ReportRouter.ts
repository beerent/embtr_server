import express from 'express';
import reportRouterV1 from './ReportRouterV1';

const reportRouter = express.Router();

reportRouter.use('/v1/report', reportRouterV1);

//default fallback is always latest
reportRouter.use('/:version/report', reportRouterV1);

export default reportRouter;
