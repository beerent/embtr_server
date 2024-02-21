import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import {
    validateScheduledHabitArchive,
    validateScheduledHabitGet,
    validateScheduledHabitPost,
} from '@src/middleware/scheduled_habit/ScheduledHabitValidation';
import { HabitCategoryService } from '@src/service/HabitCategoryService';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';
import express from 'express';
import { ContextService } from '@src/service/ContextService';
import { HabitCategoryValidation } from '@src/middleware/habit_category/HabitCategoryValidation';
import { PureDate } from '@resources/types/date/PureDate';
import { HabitService } from '@src/service/HabitService';
import {
    CreateTaskRequest,
    CreateTaskResponse,
    GetTaskResponse,
    SearchTasksResponse,
} from '@resources/types/requests/TaskTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import {
    GetHabitCategoriesResponse,
    GetHabitCategoryResponse,
    GetHabitSummariesResponse,
    GetHabitSummaryResponse,
} from '@resources/types/requests/HabitTypes';
import {
    ArchiveScheduledHabitRequest,
    CreateScheduledHabitRequest,
    CreateScheduledHabitResponse,
    GetScheduledHabitResponse,
    GetScheduledHabitsResponse,
} from '@resources/types/requests/ScheduledHabitTypes';
import { validateSearch as validateSearchTasks } from '@src/middleware/task/TaskValidation';
import { Task } from '@resources/schema';
import { routeLogger } from '@src/middleware/logging/LoggingMiddleware';

const habitRouterLatest = express.Router();
const v = '✓';

habitRouterLatest.get(
    '/categories/generic',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);

        const habitCategories = await HabitCategoryService.getAllGeneric(context);
        const response: GetHabitCategoriesResponse = {
            ...SUCCESS,
            habitCategories,
        };

        res.json(response);
    }
);

habitRouterLatest.get(
    '/categories/custom',
    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);

        const customHabitCategory = await HabitCategoryService.getCustom(context);
        const response: GetHabitCategoryResponse = {
            ...SUCCESS,
            habitCategory: customHabitCategory,
        };
        res.json(response);
    }
);

habitRouterLatest.get(
    '/categories/active',
    routeLogger(v),
    authenticate,
    authorize,
    HabitCategoryValidation.validateGetActiveHabitsCategory,
    async (req, res) => {
        const context = await ContextService.get(req);
        const date: PureDate = PureDate.fromString(req.query.date as string);

        const habitCategory = await HabitCategoryService.getActive(context, date);
        const response: GetHabitCategoryResponse = { ...SUCCESS, habitCategory };
        res.json(response);
    }
);

habitRouterLatest.get(
    '/categories/recent',

    routeLogger(v),
    authenticate,
    authorize,
    async (req, res) => {
        const context = await ContextService.get(req);
        const habitCategory = await HabitCategoryService.getRecent(context);

        const response: GetHabitCategoryResponse = { ...SUCCESS, habitCategory };
        res.json(response);
    }
);

habitRouterLatest.get(
    '/summary',
    routeLogger(v),
    authenticate,
    authorize,
    HabitCategoryValidation.validateGetHabitSummaries,
    async (req, res) => {
        const context = await ContextService.get(req);
        const cutoffDate: PureDate = PureDate.fromString(req.query.cutoffDate as string);

        const habitSummaries = await ScheduledHabitService.getHabitSummaries(context, cutoffDate);
        const response: GetHabitSummariesResponse = { ...SUCCESS, habitSummaries };
        res.json(response);
    }
);

habitRouterLatest.get(
    '/summary/:id',
    routeLogger(v),
    authenticate,
    authorize,
    HabitCategoryValidation.validateGetHabitSummary,
    async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);
        const cutoffDate: PureDate = PureDate.fromString(req.query.cutoffDate as string);

        const habitSummary = await ScheduledHabitService.getHabitSummary(context, id, cutoffDate);
        const response: GetHabitSummaryResponse = { ...SUCCESS, habitSummary: habitSummary };
        res.json(response);
    }
);

habitRouterLatest.get(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    validateSearchTasks,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const query = req.query.q as string;

        const tasks: Task[] = await HabitService.search(context, query);
        const response: SearchTasksResponse = { ...SUCCESS, tasks };
        res.json(response);
    })
);

habitRouterLatest.get(
    '/:id',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const habit = await HabitService.get(context, id);
        const response: GetTaskResponse = { ...SUCCESS, task: habit };
        res.json(response);
    })
);

habitRouterLatest.post(
    '/',
    routeLogger(v),
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateTaskRequest = req.body;
        const habit = request.task;

        const createdHabit = await HabitService.create(context, habit);
        const response: CreateTaskResponse = { ...SUCCESS, task: createdHabit };
        res.json(response);
    })
);

habitRouterLatest.post(
    '/schedule/:id/archive',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitArchive,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);
        const request: ArchiveScheduledHabitRequest = req.body;
        const date: PureDate = PureDate.fromObject(request.date);

        await ScheduledHabitService.archive(context, id, date);
        res.json(SUCCESS);
    })
);

habitRouterLatest.post(
    '/schedule',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitPost,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const request: CreateScheduledHabitRequest = req.body;
        const scheduledHabit = request.scheduledHabit;

        const createdScheduledHabit = await ScheduledHabitService.createOrUpdate(
            context,
            scheduledHabit
        );
        const response: CreateScheduledHabitResponse = {
            ...SUCCESS,
            scheduledHabit: createdScheduledHabit,
        };
        res.json(response);
    })
);

habitRouterLatest.get(
    '/:id/schedules',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitGet,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const scheduledHabits = await ScheduledHabitService.getAllByHabit(context, id);
        const response: GetScheduledHabitsResponse = { ...SUCCESS, scheduledHabits };
        res.json(response);
    })
);

habitRouterLatest.get(
    '/schedule/:id',
    routeLogger(v),
    authenticate,
    authorize,
    validateScheduledHabitGet,
    runEndpoint(async (req, res) => {
        const context = await ContextService.get(req);
        const id = Number(req.params.id);

        const scheduledHabit = await ScheduledHabitService.get(context, id);
        const response: GetScheduledHabitResponse = { ...SUCCESS, scheduledHabit };
        res.json(response);
    })
);

export default habitRouterLatest;
