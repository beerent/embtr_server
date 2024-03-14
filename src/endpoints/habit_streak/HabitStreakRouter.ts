import express from 'express';
import habitStreakRouterLatest from './HabitStreakRouterLatest';

const habitStreakRouter = express.Router();

habitStreakRouter.use('/:version/habit-streak', habitStreakRouterLatest);

export default habitStreakRouter;
