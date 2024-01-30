import express from 'express';
import unitRouterV1 from '@src/endpoints/unit/UnitRouterV1';

const unitRouter = express.Router();

unitRouter.use('/v1/unit', unitRouterV1);

//default fallback is always latest
unitRouter.use('/:version/unit', unitRouterV1);

export default unitRouter;
