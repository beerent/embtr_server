import { authenticate } from '@src/middleware/authentication';
import { runEndpoint } from '@src/middleware/error/ErrorMiddleware';
import { authorize } from '@src/middleware/general/GeneralAuthorization';
import { validateSearch as validateSearchTasks } from '@src/middleware/task/TaskValidation';
import { TaskService } from '@src/service/TaskService';
import express from 'express';
import { validateScheduledHabitGet } from '@src/middleware/scheduled_habit/ScheduledHabitValidation';
import { ContextService } from '@src/service/ContextService';
import { ScheduledHabitService } from '@src/service/ScheduledHabitService';

const taskRouter = express.Router();

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
        const response = await TaskService.create(req);
        res.status(response.httpCode).json(response);
    })
);

export default taskRouter;
