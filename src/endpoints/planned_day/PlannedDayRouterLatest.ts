import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateGetById,
    validateGetByUser,
    validatePlannedDayPost,
    validatePlannedTaskPost,
} from '@src/middleware/planned_day/PlannedDayValidation';
import { PlannedDayService } from '@src/service/PlannedDayService';
import { PlannedHabitService } from '@src/service/PlannedHabitService';
import express from 'express';
import { ContextService } from '@src/service/ContextService';
import { PlannedTask } from '@resources/schema';
import { SUCCESS } from '@src/common/RequestResponses';
import { Context } from '@src/general/auth/Context';
import {
    CreatePlannedDayResponse,
    GetPlannedDayResponse,
} from '@resources/types/requests/PlannedDayTypes';
import { GetBooleanResponse } from '@resources/types/requests/GeneralTypes';
import {
    CreatePlannedTaskResponse,
    UpdatePlannedTaskResponse,
} from '@resources/types/requests/PlannedTaskTypes';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const plannedDayRouterLatest = express.Router();
const v = '✓';

plannedDayRouterLatest.get(
    '/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const plannedDay = await PlannedDayService.getById(context, id);
        const response: GetPlannedDayResponse = { ...SUCCESS, plannedDay };
        res.json(response);
    })
);

plannedDayRouterLatest.get(
    '/:userId/:dayKey/isComplete',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetByUser,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);
        const dayKey = req.params.dayKey;

        const isComplete = await PlannedDayService.getIsComplete(context, userId, dayKey);
        const response: GetBooleanResponse = { ...SUCCESS, result: isComplete };
        res.json(response);
    })
);

plannedDayRouterLatest.post(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    validatePlannedDayPost,
    runEndpoint(async (req, res) => {
        const context: Context = await ContextService.get(req);
        const dayKey = req.body.dayKey;

        const plannedDay = await PlannedDayService.create(context, dayKey);
        const response: CreatePlannedDayResponse = { ...SUCCESS, plannedDay };
        res.json(response);
    })
);

plannedDayRouterLatest.get(
    '/:userId/:dayKey',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetByUser,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const userId = Number(req.params.userId);
        const dayKey = req.params.dayKey;

        const plannedDay = await PlannedDayService.getByUser(context, userId, dayKey);
        const response: GetPlannedDayResponse = { ...SUCCESS, plannedDay };
        res.json(response);
    })
);

plannedDayRouterLatest.post(
    '/:dayKey/planned-task',
    routeLogger(v),
    authenticate,
    authorize,
    validatePlannedTaskPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const dayKey = req.params.dayKey;
        const plannedTask: PlannedTask = req.body.plannedTask;

        const updatedPlannedTask = await PlannedHabitService.createOrUpdate(
            context,
            dayKey,
            plannedTask
        );
        const response: CreatePlannedTaskResponse = {
            ...SUCCESS,
            plannedTask: updatedPlannedTask,
        };
        res.json(response);
    })
);

plannedDayRouterLatest.put(
    '/planned-task/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const plannedTask: PlannedTask = req.body.plannedTask;

        const updatedPlannedTask = await PlannedHabitService.update(context, plannedTask);

        const response: UpdatePlannedTaskResponse = {
            ...SUCCESS,
            plannedTask: updatedPlannedTask,
        };
        res.json(response);
    })
);

export default plannedDayRouterLatest;
