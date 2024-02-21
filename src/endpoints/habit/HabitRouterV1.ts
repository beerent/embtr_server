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
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateScheduledHabitArchive,
    validateScheduledHabitGet,
    validateScheduledHabitPost,
} from '@src/middleware/scheduled_habit/ScheduledHabitValidation';
import { ScheduledHabitTransformationServiceV1 } from '@src/transform/ScheduledHabitTransformationService';

const habitRouterV1 = express.Router();
const v = 'v1';

const transformationService = new ScheduledHabitTransformationServiceV1();

//TODO - transform/ deprecate this
habitRouterV1.post(
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

/**
 * @deprecated on version 1.0.14 (use version 2.0.0)
 */
habitRouterV1.post(
    '/schedule',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateScheduledHabitRequest = req.body;
        const scheduledHabit = request.scheduledHabit;
        const transformedScheduledHabit = transformationService.transformIn(scheduledHabit);

        const createdScheduledHabit = await ScheduledHabitService.createOrUpdate(
            context,
            transformedScheduledHabit
        );
        const transformedCreatedScheduledHabit =
            transformationService.transformOut(createdScheduledHabit);
        const response: CreateScheduledHabitResponse = {
            ...SUCCESS,
            scheduledHabit: transformedCreatedScheduledHabit,
        };
        res.json(response);
    })
);

/**
 * @deprecated on version 1.0.14 (use version 2.0.0)
 */
habitRouterV1.get(
    '/:id/schedules',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitGet,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const scheduledHabits = await ScheduledHabitService.getAllByHabit(context, id);
        const transformedScheduledHabits = transformationService.transformOut(scheduledHabits);
        const response: GetScheduledHabitsResponse = {
            ...SUCCESS,
            scheduledHabits: transformedScheduledHabits,
        };
        res.json(response);
    })
);

/**
 * @deprecated on version 1.0.14 (use version 2.0.0)
 */
habitRouterV1.get(
    '/schedule/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitGet,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const scheduledHabit = await ScheduledHabitService.get(context, id);
        const transformedScheduledHabit = transformationService.transformOut(scheduledHabit);
        const response: GetScheduledHabitResponse = {
            ...SUCCESS,
            scheduledHabit: transformedScheduledHabit,
        };
        res.json(response);
    })
);

export default habitRouterV1;
