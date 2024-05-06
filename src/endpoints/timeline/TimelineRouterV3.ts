import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { TimelineService } from '@src/service/TimelineService';
import { ContextService } from '@src/service/ContextService';
import { TimelineData, TimelineElement } from '@resources/types/requests/Timeline';
import { DateUtility } from '@src/utility/date/DateUtility';
import { SUCCESS } from '@src/common/RequestResponses';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { TimelineTransformationServiceV3 } from '@src/transform/TimelineTransformationService';
import { ChallengeTypesV3 } from '../challenge/ChallengeRouterV3';
import { Response } from '@resources/types/requests/RequestTypes';

const timelineRouterV3 = express.Router();
const v = 'v3';

export namespace TimelineTypesV3 {
    export interface GetTimelineResponseV3 extends Response {
        timelineData?: TimelineDataV3;
    }

    export interface TimelineDataV3 extends TimelineData {
        elements: TimelineElementV3[];
    }

    export interface TimelineElementV3 extends TimelineElement {
        challengeRecentlyJoined?: ChallengeTypesV3.ChallengeRecentlyJoinedV3;
    }
}

timelineRouterV3.get('/', routeLogger(v), authenticate, authorize, async (req, res) => {
    const context = await ContextService.get(req);
    const cursor: Date = DateUtility.getOptionalDate(req.query.cursor as string);
    const limit: number | undefined = req.query.limit
        ? Number(req.query.limit as string)
        : undefined;

    const timelineData: TimelineData = await TimelineService.get(context, cursor, limit);
    const transformedTimelineData =
        TimelineTransformationServiceV3.transformOutTimelineData(timelineData);
    const response: TimelineTypesV3.GetTimelineResponseV3 = {
        ...SUCCESS,
        timelineData: transformedTimelineData,
    };
    res.json(response);
});

export default timelineRouterV3;
