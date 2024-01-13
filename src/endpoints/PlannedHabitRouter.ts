import { GetPlannedHabitResponse } from '@resources/types/requests/PlannedTaskTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateGetById } from '@src/middleware/planned_day/PlannedDayValidation';
import { ContextService } from '@src/service/ContextService';
import { PlannedHabitService } from '@src/service/PlannedHabitService';
import express from 'express';

const plannedHabitRouter = express.Router();

plannedHabitRouter.get(
    '/v1/:id',
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const plannedHabit = await PlannedHabitService.getById(context, id);
        const response: GetPlannedHabitResponse = { ...SUCCESS, plannedHabit };
        res.json(response);
    })
);

export default plannedHabitRouter;
