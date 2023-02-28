import { CreateTaskRequest, CreateTaskResponse, GetTaskResponse } from '@resources/types';
import { CREATE_TASK_FAILED_ALREADY_EXISTS, GET_TASK_FAILED_NOT_FOUND, GET_TASK_SUCCESS, SUCCESS } from '@src/common/RequestResponses';
import { TaskController } from '@src/controller/TaskController';

export class TaskService {
    public static async get(id: string | number): Promise<GetTaskResponse> {
        if (isNaN(Number(id))) {
            return GET_TASK_FAILED_NOT_FOUND;
        }

        const task = await TaskController.get(Number(id));
        if (task) {
            return { ...GET_TASK_SUCCESS, task: { title: task.title, description: task.description } };
        }

        return GET_TASK_FAILED_NOT_FOUND;
    }

    public static async create(body: CreateTaskRequest): Promise<CreateTaskResponse> {
        const preExistingTask = await TaskController.getByTitle(body.title);
        if (preExistingTask) {
            return CREATE_TASK_FAILED_ALREADY_EXISTS;
        }

        const newTask = await TaskController.create(body.title, body.description);
        return SUCCESS;
    }
}
