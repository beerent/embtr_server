import { GetPlannedDayRequest } from '@resources/types/requests/PlannedDayTypes';
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

const plannedDayRouter = express.Router();

plannedDayRouter.get(
    '/:id',
    authenticate,
    authorize,
    validateGetById,
    runEndpoint(async (req, res) => {
        const id = Number(req.params.id);

        const response = await PlannedDayService.getById(id);
        res.status(response.httpCode).json(response);
    })
);

plannedDayRouter.get(
    '/:userId/:dayKey',
    authenticate,
    authorize,
    validateGetByUser,
    runEndpoint(async (req, res) => {
        const request: GetPlannedDayRequest = {
            userId: Number(req.params.userId),
            dayKey: req.params.dayKey,
        };

        const response = await PlannedDayService.getByUser(request);
        res.status(response.httpCode).json(response);
    })
);

plannedDayRouter.get(
    '/:userId/:dayKey/isComplete',
    authenticate,
    authorize,
    validateGetByUser,
    runEndpoint(async (req, res) => {
        const request: GetPlannedDayRequest = {
            userId: Number(req.params.userId),
            dayKey: req.params.dayKey,
        };

        const response = await PlannedDayService.getIsComplete(request);
        res.status(response.httpCode).json(response);
    })
);

plannedDayRouter.post(
    '/',
    authenticate,
    authorize,
    validatePlannedDayPost,
    runEndpoint(async (req, res) => {
        const response = await PlannedDayService.create(req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayRouter.post(
    '/:dayKey/planned-task',
    authenticate,
    authorize,
    validatePlannedTaskPost,
    runEndpoint(async (req, res) => {
        const dayKey = req.params.dayKey;
        const response = await PlannedHabitService.createOrUpdate(dayKey, req);
        res.status(response.httpCode).json(response);
    })
);

plannedDayRouter.put(
    '/planned-task/',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response = await PlannedHabitService.update(req);
        res.status(response.httpCode).json(response);
    })
);

export default plannedDayRouter;
