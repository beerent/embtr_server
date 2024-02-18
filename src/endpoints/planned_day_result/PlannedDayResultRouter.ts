import express from 'express';
import plannedDayResultRouterLatest from './PlannedDayResultRouterLatest';

const plannedDayResultRouter = express.Router();

plannedDayResultRouter.use('/:version/planned-day-result', plannedDayResultRouterLatest);

export default plannedDayResultRouter;
