import express from 'express';
import timeOfTheDayRouterLatest from './TimeOfTheDayRouterLatest';

const timeOfTheDayRouter = express.Router();

timeOfTheDayRouter.use('/:version/time-of-the-day', timeOfTheDayRouterLatest);

export default timeOfTheDayRouter;
