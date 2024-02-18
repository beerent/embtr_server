import express from 'express';
import plannedDayRouterV1 from './PlannedDayRouterV1';
import plannedDayRouterV2 from './PlannedDayRouterV2';

const plannedDayRouter = express.Router();

plannedDayRouter.use('/v2/planned-day', plannedDayRouterV2);
plannedDayRouter.use('/v1/planned-day', plannedDayRouterV1);

//default fallback is always latest
plannedDayRouter.use('/:version/planned-day', plannedDayRouterV1);

export default plannedDayRouter;
