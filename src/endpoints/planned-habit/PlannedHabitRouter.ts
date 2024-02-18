import express from 'express';
import plannedHabitRouterV1 from '@src/endpoints/planned-habit/PlannedHabitRouterV1';
import plannedHabitRouterV2 from './PlannedHabitRouterV2';

const plannedHabitRouter = express.Router();

plannedHabitRouter.use('/v2/planned-habit', plannedHabitRouterV2);
plannedHabitRouter.use('/v1/planned-habit', plannedHabitRouterV1);

//default fallback is always latest
plannedHabitRouter.use('/:version/planned-habit', plannedHabitRouterV1);

export default plannedHabitRouter;
