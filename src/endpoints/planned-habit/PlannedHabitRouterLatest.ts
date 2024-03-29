import express from 'express';
import {
    GetPlannedHabitCountResponse,
    GetPlannedHabitResponse,
} from '@resources/types/requests/PlannedTaskTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateGetById } from '@src/middleware/planned_day/PlannedDayValidation';
import { ContextService } from '@src/service/ContextService';
import { PlannedHabitService } from '@src/service/PlannedHabitService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const plannedHabitRouterLatest = express.Router();
const v = '✓';

plannedHabitRouterLatest.get(
    '/count',
    routeLogger(v),
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const count = await PlannedHabitService.count(context);

        const response: GetPlannedHabitCountResponse = {
            ...SUCCESS,
            count: count,
        };
        res.json(response);
    })
);

plannedHabitRouterLatest.get(
    '/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const plannedHabit = await PlannedHabitService.getById(context, id);
        const response: GetPlannedHabitResponse = {
            ...SUCCESS,
            plannedHabit: plannedHabit,
        };
        res.json(response);
    })
);

export default plannedHabitRouterLatest;
