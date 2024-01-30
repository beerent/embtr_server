import express from 'express';
import timeOfTheDayRouterV1 from '@src/endpoints/time_of_the_day/TimeOfTheDayRouterV1';

const timeOfTheDayRouter = express.Router();

timeOfTheDayRouter.use('/v1/time-of-the-day', timeOfTheDayRouterV1);

//default fallback is always latest
timeOfTheDayRouter.use('/:version/time-of-the-day', timeOfTheDayRouterV1);

export default timeOfTheDayRouter;
