import express from 'express';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateGetByUser,
    validatePlannedTaskPost,
} from '@src/middleware/planned_day/PlannedDayValidation';
import { ContextService } from '@src/service/ContextService';
import { SUCCESS } from '@src/common/RequestResponses';
import { GetPlannedDayResponse } from '@resources/types/requests/PlannedDayTypes';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import plannedDayRouterV1 from './PlannedDayRouterV1';
import { PlannedDayService } from '@src/service/PlannedDayService';
import {
    CreatePlannedTaskResponse,
    UpdatePlannedTaskResponse,
} from '@resources/types/requests/PlannedTaskTypes';
import { PlannedHabitService } from '@src/service/PlannedHabitService';
import { PlannedTask } from '@resources/schema';

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

        const plannedDay = await PlannedDayService.getByUser(context, userId, dayKey);
        const response: GetPlannedDayResponse = { ...SUCCESS, plannedDay };
        res.json(response);
    })
);

plannedDayRouterV2.post(
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

plannedDayRouterV1.put(
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

plannedDayRouterV2.use('/', plannedDayRouterV1);

export default plannedDayRouterV2;
