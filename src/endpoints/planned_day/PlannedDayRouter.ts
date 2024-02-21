import express from 'express';
import plannedDayRouterLatest from './PlannedDayRouterLatest';
import plannedDayRouterV1 from './PlannedDayRouterV1';

const plannedDayRouter = express.Router();

plannedDayRouter.use('/v1/planned-day', plannedDayRouterV1);
plannedDayRouter.use('/:version/planned-day', plannedDayRouterLatest);

export default plannedDayRouter;
