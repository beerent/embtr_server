import { Task } from '@prisma/client';
import { TaskModel } from '@resources/models/TaskModel';
import { SearchTasksResponse, GetTaskResponse, CreateTaskRequest, CreateTaskResponse } from '@resources/types/TaskTypes';
import { CREATE_TASK_FAILED_ALREADY_EXISTS, GET_TASK_FAILED_NOT_FOUND, GET_TASK_SUCCESS, SUCCESS } from '@src/common/RequestResponses';
import { TaskController } from '@src/controller/TaskController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class TaskService {
    public static async search(query: string): Promise<SearchTasksResponse> {
        const tasks: Task[] = await TaskController.getAllLikeTitle(query);
        const taskModels: TaskModel[] = ModelConverter.convertTasks(tasks);

        return { ...SUCCESS, tasks: taskModels };
    }

    public static async get(id: string | number): Promise<GetTaskResponse> {
        if (isNaN(Number(id))) {
            return GET_TASK_FAILED_NOT_FOUND;
        }

        const task = await TaskController.get(Number(id));
        if (task) {
            const taskModel: TaskModel = ModelConverter.convertTask(task);
            return { ...GET_TASK_SUCCESS, task: taskModel };
        }

        return GET_TASK_FAILED_NOT_FOUND;
    }

    public static async create(body: CreateTaskRequest): Promise<CreateTaskResponse> {
        const preExistingTask = await TaskController.getByTitle(body.title);
        if (preExistingTask) {
            return CREATE_TASK_FAILED_ALREADY_EXISTS;
        }

        await TaskController.create(body.title, body.description);
        return SUCCESS;
    }
}
