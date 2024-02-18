import express from 'express';
import habitRouterV1 from '@src/endpoints/habit/HabitRouterV1';
import habitRouterV2 from './HabitRouterV2';

const habitRouter = express.Router();

habitRouter.use('/v2/habit', habitRouterV2);
habitRouter.use('/v1/habit', habitRouterV1);

//default fallback is always latest
habitRouter.use('/:version/habit', habitRouterV1);

export default habitRouter;
