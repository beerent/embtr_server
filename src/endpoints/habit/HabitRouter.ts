import express from 'express';
import habitRouterLatest from './HabitRouterLatest';
import habitRouterV1 from './HabitRouterV1';

const habitRouter = express.Router();

habitRouter.use('/v1/habit', habitRouterV1);
habitRouter.use('/:version/habit', habitRouterLatest);

export default habitRouter;
