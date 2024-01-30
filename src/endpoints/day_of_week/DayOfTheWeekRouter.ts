import express from 'express';
import DayOfWeekRouterV1 from '@src/endpoints/day_of_week/DayOfWeekRouterV1';

const dayOfTheWeekRouter = express.Router();

dayOfTheWeekRouter.use('/v1/day-of-the-week', DayOfWeekRouterV1);

//default fallback is always latest
dayOfTheWeekRouter.use('/:version/day-of-the-week', DayOfWeekRouterV1);

export default dayOfTheWeekRouter;
