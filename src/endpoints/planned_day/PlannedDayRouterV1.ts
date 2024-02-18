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
import { PlannedDayService } from '@src/service/PlannedDayService';
import {
    CreatePlannedTaskResponse,
    UpdatePlannedTaskResponse,
} from '@resources/types/requests/PlannedTaskTypes';
import { PlannedHabitService } from '@src/service/PlannedHabitService';
import { PlannedTask } from '@resources/schema';
import { PlannedDayTransformationServiceV1 } from '@src/transform/PlannedDayTransformationService';
import { PlannedHabitTransformationServiceV1 } from '@src/transform/PlannedHabitTransformationService';

const plannedDayRouterV1 = express.Router();
const v = 'v1';

const plannedDayTransformationService = new PlannedDayTransformationServiceV1();
const plannedHabitTransformationService = new PlannedHabitTransformationServiceV1();

/**
 * @deprecated on version 1.0.14 (use version 2.0.0)
 */
plannedDayRouterV1.post(
    '/:dayKey/planned-task',
    routeLogger(v),
    authenticate,
    authorize,
    validatePlannedTaskPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const dayKey = req.params.dayKey;
        const plannedTask: PlannedTask = req.body.plannedTask;
        const transformedPlannedTask = plannedHabitTransformationService.transformIn(plannedTask);

        const updatedPlannedTask = await PlannedHabitService.createOrUpdate(
            context,
            dayKey,
            transformedPlannedTask
        );
        const transformedUpdatedPlannedTask =
            plannedHabitTransformationService.transformOut(updatedPlannedTask);
        const response: CreatePlannedTaskResponse = {
            ...SUCCESS,
            plannedTask: transformedUpdatedPlannedTask,
        };
        res.json(response);
    })
);

/**
 * @deprecated on version 1.0.14 (use version 2.0.0)
 */
plannedDayRouterV1.put(
    '/planned-task/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const plannedTask: PlannedTask = req.body.plannedTask;

        const transformedPlannedTask = plannedHabitTransformationService.transformIn(plannedTask);
        const updatedPlannedTask = await PlannedHabitService.update(
            context,
            transformedPlannedTask
        );
        const transformedUpdatedPlannedTask =
            plannedHabitTransformationService.transformOut(updatedPlannedTask);

        const response: UpdatePlannedTaskResponse = {
            ...SUCCESS,
            plannedTask: transformedUpdatedPlannedTask,
        };
        res.json(response);
    })
);

/**
 * @deprecated on version 1.0.14 (use version 2.0.0)
 */
plannedDayRouterV1.get(
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
        const transformedPlannedDay = plannedDayTransformationService.transformOut(plannedDay);
        const response: GetPlannedDayResponse = { ...SUCCESS, plannedDay: transformedPlannedDay };
        res.json(response);
    })
);

// IDK if I need this
//plannedDayRouterV2.use('/', plannedDayRouterV1);

export default plannedDayRouterV1;
