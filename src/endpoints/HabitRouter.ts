import { authenticate } from '@src/middleware/authentication';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateScheduledHabitPost } from '@src/middleware/scheduled_habit/ScheduledHabitValidation';
import { HabitCategoryService } from '@src/service/HabitCategoryService';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';
import express from 'express';

const habitRouter = express.Router();

habitRouter.get('/categories', authenticate, authorize, async (req, res) => {
    const response = await HabitCategoryService.getAll();
    res.status(response.httpCode).json(response);
});

habitRouter.post(
    '/schedule',
    authenticate,
    authorize,
    validateScheduledHabitPost,
    async (req, res) => {
        const response = await ScheduledHabitService.create(req);
        res.status(response.httpCode).json(response);
    }
);

export default habitRouter;
