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
import { ContextService } from '@src/service/ContextService';
import { HabitCategoryValidation } from '@src/middleware/habit_category/HabitCategoryValidation';
import { PureDate } from '@resources/types/date/PureDate';

const habitRouter = express.Router();

habitRouter.get('/categories/generic', authenticate, authorize, async (req, res) => {
    const response = await HabitCategoryService.getAllGeneric(req);
    res.status(response.httpCode).json(response);
});

habitRouter.get('/categories/custom', authenticate, authorize, async (req, res) => {
    const response = await HabitCategoryService.getCustom(req);
    res.status(response.httpCode).json(response);
});

habitRouter.get(
    '/categories/active',
    authenticate,
    authorize,
    HabitCategoryValidation.validateGetActiveHabitsCategory,
    async (req, res) => {
        const context = await ContextService.get(req);
        const date: PureDate = PureDate.fromString(req.query.date as string);

        const response = await HabitCategoryService.getActive(context, date);
        res.status(response.httpCode).json(response);
    }
);

habitRouter.get('/categories/recent', authenticate, authorize, async (req, res) => {
    const response = await HabitCategoryService.getRecent(req);
    res.status(response.httpCode).json(response);
});

habitRouter.get(
    '/summary',
    authenticate,
    authorize,
    HabitCategoryValidation.validateGetHabitSummary,
    async (req, res) => {
        const context = await ContextService.get(req);
        const cutoffDate: PureDate = PureDate.fromString(req.query.cutoffDate as string);
        const response = await ScheduledHabitService.getSummaries(context, cutoffDate);

        res.status(response.httpCode).json(response);
    }
);

habitRouter.get('/summary/:id', authenticate, authorize, async (req, res) => {
    //const response = await ScheduledHabitService.getHabitSummary(req);
    //res.status(response.httpCode).json(response);
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
