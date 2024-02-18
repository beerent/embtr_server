import express from 'express';
import plannedHabitRouterV1 from '@src/endpoints/planned-habit/PlannedHabitRouterV1';
import plannedHabitRouterLatest from './PlannedHabitRouterLatest';

const plannedHabitRouter = express.Router();

plannedHabitRouter.use('/v1/planned-habit', plannedHabitRouterV1);
plannedHabitRouter.use('/:version/planned-habit', plannedHabitRouterLatest);

export default plannedHabitRouter;
