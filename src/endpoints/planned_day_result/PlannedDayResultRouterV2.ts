import { CreatePlannedDayResultResponse } from '@resources/types/requests/PlannedDayResultTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ContextService } from '@src/service/ContextService';
import { PlannedDayResultService } from '@src/service/PlannedDayResultService';
import { PlannedDayResultTransformationServiceV2 } from '@src/transform/PlannedDayResultTransformationService';
import express from 'express';

const plannedDayResultRouterV2 = express.Router();
const v = 'v2';

/**
 * @deprecated on version 2.0.26 (use version 3.0.0)
 */
plannedDayResultRouterV2.post(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const plannedDayId = Number(req.body.plannedDayId);
        const plannedDayResult = PlannedDayResultTransformationServiceV2.transformIn(
            context,
            plannedDayId
        );

        const createdPlannedDayResult = await PlannedDayResultService.create(
            context,
            plannedDayResult
        );
        const response: CreatePlannedDayResultResponse = {
            ...SUCCESS,
            plannedDayResult: createdPlannedDayResult,
        };
        res.json(response);
    })
);

export default plannedDayResultRouterV2;
