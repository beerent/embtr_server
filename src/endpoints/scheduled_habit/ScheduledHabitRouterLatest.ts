import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';
import { PureDate } from '@resources/types/date/PureDate';
import { GetScheduledHabitsResponse } from '@resources/types/requests/ScheduledHabitTypes';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';

const scheduledHabitRouterLatest = express.Router();
const v = '✓';

scheduledHabitRouterLatest.get(
    '/past',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const date: PureDate = PureDate.fromString(req.query.date as string);

        const scheduledHabits = await ScheduledHabitService.getPast(context, date);
        const response: GetScheduledHabitsResponse = { ...SUCCESS, scheduledHabits };

        res.json(response);
    })
);

scheduledHabitRouterLatest.get(
    '/active',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const date: PureDate = PureDate.fromString(req.query.date as string);

        const scheduledHabits = await ScheduledHabitService.getActive(context, date);
        const response: GetScheduledHabitsResponse = { ...SUCCESS, scheduledHabits };

        res.json(response);
    })
);

scheduledHabitRouterLatest.get(
    '/future',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const date: PureDate = PureDate.fromString(req.query.date as string);

        const scheduledHabits = await ScheduledHabitService.getFuture(context, date);
        const response: GetScheduledHabitsResponse = { ...SUCCESS, scheduledHabits };

        res.json(response);
    })
);

export default scheduledHabitRouterLatest;
