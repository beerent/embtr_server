import express from 'express';
import timelineRouterLatest from './TimelineRouterLatest';

const timelineRouter = express.Router();

timelineRouter.use('/:version/timeline', timelineRouterLatest);

export default timelineRouter;
