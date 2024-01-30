import express from 'express';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';
import { ContextService } from '@src/service/ContextService';
import { PureDate } from '@resources/types/date/PureDate';
import { SUCCESS } from '@src/common/RequestResponses';
import { ArchiveScheduledHabitRequest } from '@resources/types/requests/ScheduledHabitTypes';
import habitRouterV1 from '@src/endpoints/habit/HabitRouterV1';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateScheduledHabitArchive } from '@src/middleware/scheduled_habit/ScheduledHabitValidation';

const habitRouterV2 = express.Router();
const v = 'v2';

habitRouterV2.post(
    '/schedule/:id/archive',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitArchive,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);
        const request: ArchiveScheduledHabitRequest = req.body;
        const date: PureDate = PureDate.fromObject(request.date);

        await ScheduledHabitService.archive(context, id, date);
        res.json(SUCCESS);
    })
);

habitRouterV2.use('/', habitRouterV1);

export default habitRouterV2;
