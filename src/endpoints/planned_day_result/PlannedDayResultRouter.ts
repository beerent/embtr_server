import express from 'express';
import plannedDayResultRouterLatest from './PlannedDayResultRouterLatest';
import plannedDayResultRouterV2 from './PlannedDayResultRouterV2';

const plannedDayResultRouter = express.Router();

const versionRanges = [{ min: 1, max: 2 }];
versionRanges.forEach((range) => {
    for (let i = range.min; i <= range.max; i++) {
        plannedDayResultRouter.use(`/v${i}/planned-day-result`, plannedDayResultRouterV2);
    }
});

plannedDayResultRouter.use('/:version/planned-day-result', plannedDayResultRouterLatest);

export default plannedDayResultRouter;
