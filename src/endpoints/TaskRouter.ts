import { CreateTaskRequest } from '@resources/types/requests/TaskTypes';
import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateSearch as validateSearchTasks } from '@src/middleware/task/TaskValidation';
import { validateTaskPreference } from '@src/middleware/task_habit_preference/ValidateTaskPreference';
import { TaskHabitPreferenceService } from '@src/service/TaskHabitPreferenceService';
import { TaskService } from '@src/service/TaskService';
import express from 'express';

const taskRouter = express.Router();

taskRouter.get(
    '/recent',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response = await TaskService.recent(req);
        res.status(response.httpCode).json(response);
    })
);

taskRouter.get(
    '/recommended',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const response = await TaskService.recommended(req);
        res.status(response.httpCode).json(response);
    })
);

taskRouter.get(
    '/:id',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const id = req.params.id;

        const response = await TaskService.get(id);
        res.status(response.httpCode).json(response);
    })
);

taskRouter.get(
    '/',
    authenticate,
    authorize,
    validateSearchTasks,
    runEndpoint(async (req, res) => {
        const response = await TaskService.search(req);
        res.status(response.httpCode).json(response);
    })
);

taskRouter.post(
    '/',
    authenticate,
    authorize,
    runEndpoint(async (req, res) => {
        const body: CreateTaskRequest = req.body;
        const response = await TaskService.create(body);
        res.status(response.httpCode).json(response);
    })
);

taskRouter.put(
    '/:id/preference',
    authenticate,
    authorize,
    validateTaskPreference,
    runEndpoint(async (req, res) => {
        const response = await TaskHabitPreferenceService.update(req);
        res.status(response.httpCode).json(response);
    })
);

export default taskRouter;
