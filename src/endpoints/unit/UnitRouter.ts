import express from 'express';
import unitRouterLatest from './UnitRouterLatest';

const unitRouter = express.Router();

unitRouter.use('/:version/unit', unitRouterLatest);

export default unitRouter;
