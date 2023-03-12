import { CreateTaskRequest } from '@resources/types/TaskTypes';
import { authenticate } from '@src/middleware/authentication';
import { authorizeGet, authorizePost } from '@src/middleware/task/TaskAuthorization';
import { validateSearch as validateSearchTasks } from '@src/middleware/task/TaskValidation';
import { TaskService } from '@src/service/TaskService';
import express from 'express';

const taskRouter = express.Router();

taskRouter.get('/', authenticate, authorizeGet, validateSearchTasks, async (req, res) => {
    const query: string = req.query.q as string;

    const response = await TaskService.search(query);
    res.status(response.httpCode).json(response);
});

taskRouter.get('/:id', authenticate, authorizeGet, async (req, res) => {
    const id = req.params.id;

    const response = await TaskService.get(id);
    res.status(response.httpCode).json(response);
});

taskRouter.post('/', authenticate, authorizePost, async (req, res) => {
    const body: CreateTaskRequest = req.body;
    const response = await TaskService.create(body);
    res.status(response.httpCode).json(response);
});

export default taskRouter;
