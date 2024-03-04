import express from 'express';
import scheduledHabitRouterLatest from './ScheduledHabitRouterLatest';

const scheduledHabitRouter = express.Router();
scheduledHabitRouter.use('/:version/scheduled-habit', scheduledHabitRouterLatest);

export default scheduledHabitRouter;
