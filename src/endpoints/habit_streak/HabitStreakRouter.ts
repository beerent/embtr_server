import express from 'express';
import habitStreakRouterLatest from './HabitStreakRouterLatest';
import habitStreakRouterV4 from './HabitStreakRouterV4';

const habitStreakRouter = express.Router();

habitStreakRouter.use('/v4/habit-streak', habitStreakRouterV4);
habitStreakRouter.use('/:version/habit-streak', habitStreakRouterLatest);

export default habitStreakRouter;
