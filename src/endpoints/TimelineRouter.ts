import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { TimelineService } from '@src/service/TimelineService';
import { ContextService } from '@src/service/ContextService';
import { GetTimelineResponse, TimelineData } from '@resources/types/requests/Timeline';
import { DateUtility } from '@src/utility/date/DateUtility';
import { SUCCESS } from '@src/common/RequestResponses';

const timelineRouter = express.Router();

timelineRouter.get(
    '/',
    authenticate,
    authorize,
    /*validate, */ async (req, res) => {
        const context = await ContextService.get(req);
        const cursor: Date = DateUtility.getOptionalDate(req.body.cursor);
        const limit: number | undefined = req.body.limit ? Number(req.body.limit) : undefined;

        const timelineData: TimelineData = await TimelineService.get(context, cursor, limit);
        const response: GetTimelineResponse = { ...SUCCESS, timelineData };
        res.json(response);
    }
);

export default timelineRouter;
