import express from 'express';
import { GetPlannedHabitResponse } from '@resources/types/requests/PlannedTaskTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateGetById } from '@src/middleware/planned_day/PlannedDayValidation';
import { ContextService } from '@src/service/ContextService';
import { PlannedHabitService } from '@src/service/PlannedHabitService';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';
import { PlannedHabitTransformationServiceV1 } from '@src/transform/PlannedHabitTransformationService';

const plannedHabitRouterV1 = express.Router();
const v = 'v1';

const transformationService = new PlannedHabitTransformationServiceV1();

/**
 * @deprecated on version 1.0.14 (use version 2.0.0)
 */
plannedHabitRouterV1.get(
    '/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const plannedHabit = await PlannedHabitService.getById(context, id);
        const transformedPlannedHabit = transformationService.transformOut(plannedHabit);
        const response: GetPlannedHabitResponse = {
            ...SUCCESS,
            plannedHabit: transformedPlannedHabit,
        };
        res.json(response);
    })
);

// unsure if needed
//plannedHabitRouterV1.use('/', plannedHabitRouterLatest);

export default plannedHabitRouterV1;
