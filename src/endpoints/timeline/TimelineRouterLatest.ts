import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { TimelineService } from '@src/service/TimelineService';
import { ContextService } from '@src/service/ContextService';
import { GetTimelineResponse, TimelineData } from '@resources/types/requests/Timeline';
import { DateUtility } from '@src/utility/date/DateUtility';
import { SUCCESS } from '@src/common/RequestResponses';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const timelineRouterLatest = express.Router();
const v = '✓';

timelineRouterLatest.get(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    /*validate, */ async (req, res) => {
        const context = await ContextService.get(req);
        const cursor: Date = DateUtility.getOptionalDate(req.query.cursor as string);
        const limit: number | undefined = req.query.limit
            ? Number(req.query.limit as string)
            : undefined;

        const timelineData: TimelineData = await TimelineService.get(context, cursor, limit);
        const response: GetTimelineResponse = { ...SUCCESS, timelineData };
        res.json(response);
    }
);

export default timelineRouterLatest;
