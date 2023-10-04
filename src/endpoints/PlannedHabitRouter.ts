import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateGetById } from '@src/middleware/planned_day/PlannedDayValidation';
import { PlannedHabitService } from '@src/service/PlannedHabitService';
import express from 'express';

const plannedHabitRouter = express.Router();

plannedHabitRouter.get(
    '/:id',
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const id = Number(req.params.id);

        const response = await PlannedHabitService.getById(id);
        res.status(response.httpCode).json(response);
    })
);

export default plannedHabitRouter;
