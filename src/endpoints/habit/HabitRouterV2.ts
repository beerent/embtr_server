import express from 'express';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';
import { ContextService } from '@src/service/ContextService';
import { PureDate } from '@resources/types/date/PureDate';
import { SUCCESS } from '@src/common/RequestResponses';
import {
    ArchiveScheduledHabitRequest,
    CreateScheduledHabitRequest,
    CreateScheduledHabitResponse,
    GetScheduledHabitResponse,
    GetScheduledHabitsResponse,
} from '@resources/types/requests/ScheduledHabitTypes';
import habitRouterV1 from '@src/endpoints/habit/HabitRouterV1';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateScheduledHabitArchive,
    validateScheduledHabitGet,
    validateScheduledHabitPost,
} from '@src/middleware/scheduled_habit/ScheduledHabitValidation';

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

habitRouterV2.post(
    '/schedule',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateScheduledHabitRequest = req.body;
        const scheduledHabit = request.scheduledHabit;

        const createdScheduledHabit = await ScheduledHabitService.createOrUpdate(
            context,
            scheduledHabit
        );
        const response: CreateScheduledHabitResponse = {
            ...SUCCESS,
            scheduledHabit: createdScheduledHabit,
        };
        res.json(response);
    })
);

habitRouterV2.get(
    '/:id/schedules',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitGet,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const scheduledHabits = await ScheduledHabitService.getAllByHabit(context, id);
        const response: GetScheduledHabitsResponse = { ...SUCCESS, scheduledHabits };
        res.json(response);
    })
);

habitRouterV2.get(
    '/schedule/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitGet,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const scheduledHabit = await ScheduledHabitService.get(context, id);
        const response: GetScheduledHabitResponse = { ...SUCCESS, scheduledHabit };
        res.json(response);
    })
);

habitRouterV2.use('/', habitRouterV1);

export default habitRouterV2;
