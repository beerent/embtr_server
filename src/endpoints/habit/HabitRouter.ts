import express from 'express';
import habitRouterV1 from '@src/endpoints/habit/HabitRouterV1';

const habitRouter = express.Router();

//example version 2
//habitRouter.use('/v2/habit', habitRouterV2);

habitRouter.use('/v1/habit', habitRouterV1);

//default fallback is always latest
habitRouter.use('/:version/habit', habitRouterV1);

export default habitRouter;
