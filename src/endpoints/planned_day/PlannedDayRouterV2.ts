import express from 'express';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import plannedDayRouterV1 from './PlannedDayRouterV1';
import { validateGetByUser } from '@src/middleware/planned_day/PlannedDayValidation';
import { GetPlannedDayResponse } from '@resources/types/requests/PlannedDayTypes';
import { PlannedDayServiceV2 } from '@src/service/planned_day_service/PlannedDayServiceV2';

const plannedDayRouterV2 = express.Router();
const v = 'v2';

plannedDayRouterV2.get(
    '/:userId/:dayKey',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetByUser,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);
        const dayKey = req.params.dayKey;

        const plannedDay = await PlannedDayServiceV2.getByUser(context, userId, dayKey);
        const response: GetPlannedDayResponse = { ...SUCCESS, plannedDay };
        res.json(response);
    })
);

plannedDayRouterV2.use('/', plannedDayRouterV1);

export default plannedDayRouterV2;
