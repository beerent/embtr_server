import { CreateTaskRequest } from '@resources/types';
import { authenticate } from '@src/middleware/authentication';
import { authorizeGet, authorizePost } from '@src/middleware/task/TaskAuthorization';
import { TaskService } from '@src/service/TaskService';
import express from 'express';

const taskRouter = express.Router();

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
