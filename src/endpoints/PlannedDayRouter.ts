import { GetPlannedDayRequest } from '@resources/types';
import { authenticate } from '@src/middleware/authentication';
import { authorizeGet, authorizePost } from '@src/middleware/planned_day/PlannedDayAuthorization';
import { validateGetById, validateGetByUser, validatePlannedDayPost, validatePlannedTaskPost } from '@src/middleware/planned_day/PlannedDayValidation';
import { PlannedDayService } from '@src/service/PlannedDayService';
import express from 'express';

const plannedDayRouter = express.Router();

plannedDayRouter.get('/:id', authenticate, authorizeGet, validateGetById, async (req, res) => {
    const id = Number(req.params.id);

    const response = await PlannedDayService.getById(id);
    res.status(response.httpCode).json(response);
});

plannedDayRouter.get('/:userId/:dayKey', authenticate, authorizeGet, validateGetByUser, async (req, res) => {
    const request: GetPlannedDayRequest = {
        userId: Number(req.params.userId),
        dayKey: req.params.dayKey,
    };

    const response = await PlannedDayService.getByUser(request);
    res.status(response.httpCode).json(response);
});

plannedDayRouter.post('/', authenticate, authorizePost, validatePlannedDayPost, async (req, res) => {
    const response = await PlannedDayService.create(req);
    res.status(response.httpCode).json(response);
});

plannedDayRouter.post('/planned-task', authenticate, authorizePost, validatePlannedTaskPost, async (req, res) => {
    const response = await PlannedDayService.createPlannedTask(req);
    res.status(response.httpCode).json(response);
});

export default plannedDayRouter;
