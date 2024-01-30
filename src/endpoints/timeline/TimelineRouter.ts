import express from 'express';
import timelineRouterV1 from '@src/endpoints/timeline/TimelineRouterV1';

const timelineRouter = express.Router();

timelineRouter.use('/v1/timeline', timelineRouterV1);

//default fallback is always latest
timelineRouter.use('/:version/timeline', timelineRouterV1);

export default timelineRouter;
