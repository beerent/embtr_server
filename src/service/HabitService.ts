import { Code } from '@resources/codes';
import { Task } from '@resources/schema';
import { TaskDao } from '@src/database/TaskDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { DeprecatedImageUtility } from '@src/utility/DeprecatedImageUtility';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class HabitService {
    public static async search(context: Context, query: string): Promise<Task[]> {
        const tasks = await TaskDao.getAllLikeTitle(context.userId, query);
        const taskModels: Task[] = ModelConverter.convertAll(tasks);

        return taskModels;
    }

    public static async get(context: Context, id: number): Promise<Task> {
        const task = await TaskDao.get(id);
        if (!task) {
            throw new ServiceException(404, Code.HABIT_NOT_FOUND, 'habit not found');
        }

        const taskModel: Task = ModelConverter.convert(task);
        return taskModel;
    }

    public static async getWithChallengeData(context: Context, id: number): Promise<Task> {
        const task = await TaskDao.get(id);
        if (!task) {
            throw new ServiceException(404, Code.HABIT_NOT_FOUND, 'habit not found');
        }

        const taskModel: Task = ModelConverter.convert(task);
        // deprecated on 4.0.13
        DeprecatedImageUtility.setTaskImages(taskModel);

        return taskModel;
    }

    public static async create(context: Context, habit: Task): Promise<Task> {
        const task = await TaskDao.create(context.userId, habit);
        if (!task) {
            throw new ServiceException(500, Code.HABIT_NOT_FOUND, 'habit create failed');
        }

        const taskModel: Task = ModelConverter.convert(task);

        // deprecated on 4.0.13
        DeprecatedImageUtility.setTaskImages(taskModel);

        return taskModel;
    }

    public static async update(context: Context, habit: Task): Promise<Task> {
        const task = await TaskDao.update(habit);
        if (!task) {
            throw new ServiceException(500, Code.HABIT_NOT_FOUND, 'habit update failed');
        }

        const taskModel: Task = ModelConverter.convert(task);

        // deprecated on 4.0.13
        DeprecatedImageUtility.setTaskImages(taskModel);

        return taskModel;
    }
}
