import express from 'express';
import plannedDayResultRouterV1 from './PlannedDayResultRouterV1';

const plannedDayResultRouter = express.Router();

plannedDayResultRouter.use('/v1/planned-day-result', plannedDayResultRouterV1);

//default fallback is always latest
plannedDayResultRouter.use('/:version/planned-day-result', plannedDayResultRouterV1);

export default plannedDayResultRouter;
