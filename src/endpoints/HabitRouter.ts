import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateScheduledHabitGet,
    validateScheduledHabitPost,
} from '@src/middleware/scheduled_habit/ScheduledHabitValidation';
import { HabitCategoryService } from '@src/service/HabitCategoryService';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';
import express from 'express';

const habitRouter = express.Router();

habitRouter.get('/categories', authenticate, authorize, async (req, res) => {
    const response = await HabitCategoryService.getAll(req);
    res.status(response.httpCode).json(response);
});

habitRouter.post(
    '/schedule',
    authenticate,
    authorize,
    validateScheduledHabitPost,
    runEndpoint(async (req, res) => {
        const response = await ScheduledHabitService.createOrUpdate(req);
        res.status(response.httpCode).json(response);
    })
);

habitRouter.post(
    '/schedule/:id/archive',
    authenticate,
    authorize,
    validateScheduledHabitGet,
    runEndpoint(async (req, res) => {
        const response = await ScheduledHabitService.archive(req);
        res.status(response.httpCode).json(response);
    })
);

habitRouter.get(
    '/schedule/:id',
    authenticate,
    authorize,
    validateScheduledHabitGet,
    runEndpoint(async (req, res) => {
        const id = Number(req.params.id);

        const response = await ScheduledHabitService.get(id);
        res.status(response.httpCode).json(response);
    })
);

export default habitRouter;
