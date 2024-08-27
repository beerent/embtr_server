import express from 'express';
import habitRouterLatest from './HabitRouterLatest';

const habitRouter = express.Router();

habitRouter.use('/:version/habit', habitRouterLatest);

export default habitRouter;
