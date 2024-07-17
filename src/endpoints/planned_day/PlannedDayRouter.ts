import express from 'express';
import plannedDayRouterLatest from './PlannedDayRouterLatest';

const plannedDayRouter = express.Router();

plannedDayRouter.use('/:version/planned-day', plannedDayRouterLatest);

export default plannedDayRouter;
