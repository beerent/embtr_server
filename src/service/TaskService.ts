import { Task } from '@prisma/client';
import { Task as TaskModel } from '@resources/schema';
import {
    SearchTasksResponse,
    GetTaskResponse,
    CreateTaskRequest,
    CreateTaskResponse,
} from '@resources/types/requests/TaskTypes';
import {
    CREATE_TASK_FAILED_ALREADY_EXISTS,
    GENERAL_FAILURE,
    GET_TASK_FAILED_NOT_FOUND,
    GET_TASK_SUCCESS,
    SUCCESS,
} from '@src/common/RequestResponses';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { MetadataDao } from '@src/database/MetadataDao';
import { TaskDao } from '@src/database/TaskDao';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

export class TaskService {
    public static async search(request: Request): Promise<SearchTasksResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        const query: string = request.query.q as string;

        const tasks: Task[] = await TaskDao.getAllLikeTitle(userId, query);
        const taskModels: TaskModel[] = ModelConverter.convertAll(tasks);

        return { ...SUCCESS, tasks: taskModels };
    }

    public static async get(id: string | number): Promise<GetTaskResponse> {
        if (isNaN(Number(id))) {
            return GET_TASK_FAILED_NOT_FOUND;
        }

        const task = await TaskDao.get(Number(id));
        if (task) {
            const taskModel: TaskModel = ModelConverter.convert(task);
            return { ...GET_TASK_SUCCESS, task: taskModel };
        }

        return GET_TASK_FAILED_NOT_FOUND;
    }

    public static async create(request: Request): Promise<CreateTaskResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return GENERAL_FAILURE;
        }

        const body: CreateTaskRequest = request.body;

        const task = await TaskDao.create(
            userId,
            body.title,
            body.description,
            body.localImage,
            body.removeImageUrl
        );
        if (task) {
            const taskModel: TaskModel = ModelConverter.convert(task);
            return { ...SUCCESS, task: taskModel };
        }

        return CREATE_TASK_FAILED_ALREADY_EXISTS;
    }

    public static async recommended(request: Request): Promise<SearchTasksResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const recommendedIds = await MetadataDao.get('RECOMMENDED_TASKS');
        if (!recommendedIds) {
            return { ...SUCCESS, tasks: [] };
        }

        const ids = recommendedIds.value.split(',').map((id) => Number(id));
        const tasks: Task[] = await TaskDao.getByIds(userId, ids);
        const taskModels: TaskModel[] = ModelConverter.convertAll(tasks);

        return { ...SUCCESS, tasks: taskModels };
    }
}
