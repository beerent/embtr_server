import express from 'express';
import plannedDayResultRouterLatest from './PlannedDayResultRouterLatest';
import plannedDayResultRouterV2 from './PlannedDayResultRouterV2';

const plannedDayResultRouter = express.Router();

plannedDayResultRouter.use('/v2/planned-day-result', plannedDayResultRouterV2);
plannedDayResultRouter.use('/:version/planned-day-result', plannedDayResultRouterLatest);

export default plannedDayResultRouter;
