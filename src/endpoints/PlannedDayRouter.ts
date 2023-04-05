import { GetPlannedDayRequest } from '@resources/types/requests/PlannedDayTypes';
import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateGetById,
    validateGetByUser,
    validatePlannedDayPost,
    validatePlannedTaskPatch,
    validatePlannedTaskPost,
} from '@src/middleware/planned_day/PlannedDayValidation';
import { PlannedDayService } from '@src/service/PlannedDayService';
import express from 'express';

const plannedDayRouter = express.Router();

plannedDayRouter.get('/:id', authenticate, authorize, validateGetById, async (req, res) => {
    const id = Number(req.params.id);

    const response = await PlannedDayService.getById(id);
    res.status(response.httpCode).json(response);
});

plannedDayRouter.get('/:userId/:dayKey', authenticate, authorize, validateGetByUser, async (req, res) => {
    const request: GetPlannedDayRequest = {
        userId: Number(req.params.userId),
        dayKey: req.params.dayKey,
    };

    const response = await PlannedDayService.getByUser(request);
    res.status(response.httpCode).json(response);
});

plannedDayRouter.post('/', authenticate, authorize, validatePlannedDayPost, async (req, res) => {
    const response = await PlannedDayService.create(req);
    res.status(response.httpCode).json(response);
});

plannedDayRouter.post('/planned-task', authenticate, authorize, validatePlannedTaskPost, async (req, res) => {
    const response = await PlannedDayService.createPlannedTask(req);
    res.status(response.httpCode).json(response);
});

plannedDayRouter.patch('/planned-task', authenticate, authorize, validatePlannedTaskPatch, async (req, res) => {
    const response = await PlannedDayService.update(req);
    res.status(response.httpCode).json(response);
});

export default plannedDayRouter;
