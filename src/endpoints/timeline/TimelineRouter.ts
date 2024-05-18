import express from 'express';
import timelineRouterLatest from './TimelineRouterLatest';
import timelineRouterV3 from './TimelineRouterV3';

const timelineRouter = express.Router();

const versionRanges = [{ min: 1, max: 3 }];
versionRanges.forEach((range) => {
    for (let i = range.min; i <= range.max; i++) {
        timelineRouter.use(`/v${i}/timeline`, timelineRouterV3);
    }
});

timelineRouter.use('/:version/timeline', timelineRouterLatest);

export default timelineRouter;
