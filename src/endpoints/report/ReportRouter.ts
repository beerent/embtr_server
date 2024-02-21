import express from 'express';
import reportRouterLatest from './ReportRouterLatest';

const reportRouter = express.Router();

reportRouter.use('/:version/report', reportRouterLatest);

export default reportRouter;
