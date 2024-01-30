import express from 'express';
import plannedDayRouterV1 from './PlannedDayRouterV1';

const plannedDayRouter = express.Router();

plannedDayRouter.use('/v1/planned-day', plannedDayRouterV1);

//default fallback is always latest
plannedDayRouter.use('/:version/planned-day', plannedDayRouterV1);

export default plannedDayRouter;
