import express from 'express';
import plannedHabitRouterV1 from '@src/endpoints/planned-habit/PlannedHabitRouterV1';

const plannedHabitRouter = express.Router();

plannedHabitRouter.use('/v1/planned-habit', plannedHabitRouterV1);

//default fallback is always latest
plannedHabitRouter.use('/:version/planned-habit', plannedHabitRouterV1);

export default plannedHabitRouter;
