import express from 'express';
import dayOfWeekRouterLatest from './DayOfWeekRouterLatest';

const dayOfTheWeekRouter = express.Router();

dayOfTheWeekRouter.use('/:version/day-of-the-week', dayOfWeekRouterLatest);

export default dayOfTheWeekRouter;
