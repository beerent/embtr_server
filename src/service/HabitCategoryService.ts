import { HabitCategory, ScheduledHabit, Task } from '@resources/schema';
import {
    GetHabitCategoriesResponse,
    GetHabitCategoryResponse,
} from '@resources/types/requests/HabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ScheduledHabitService } from './ScheduledHabitService';
import { Request } from 'express';
import { ContextService } from './ContextService';
import { Context } from '@src/general/auth/Context';
import { PureDate } from '@resources/types/date/PureDate';
import { HabitCategoryDao } from '@src/database/HabitCategoryDao';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';

export class HabitCategoryService {
    public static async getAllGeneric(context: Context): Promise<HabitCategory[]> {
        const genericHabitCategories = await HabitCategoryDao.getAllGeneric();
        const genericHabitCategoriesModels =
            ModelConverter.convertAll<HabitCategory>(genericHabitCategories);

        return genericHabitCategoriesModels;
    }

    public static async getCustom(context: Context): Promise<HabitCategory> {
        const customHabitsCategory = await HabitCategoryDao.getCustom(context.userId);
        if (!customHabitsCategory) {
            throw new ServiceException(
                404,
                Code.HABIT_CATEGORY_NOT_FOUND,
                'habit category not found'
            );
        }

        const customHabitModels = ModelConverter.convert<HabitCategory>(customHabitsCategory);
        return customHabitModels;
    }

    public static async getRecent(context: Context): Promise<HabitCategory> {
        const habitCategory = await HabitCategoryDao.getRecent();
        if (!habitCategory) {
            throw new ServiceException(
                404,
                Code.HABIT_CATEGORY_NOT_FOUND,
                'habit category not found'
            );
        }

        const habitCategoryModel: HabitCategory = ModelConverter.convert(habitCategory);
        const populatedHabitCategoryModel = await HabitCategoryService.populateRecentHabitCategory(
            context,
            habitCategoryModel
        );

        return populatedHabitCategoryModel;
    }

    public static async getActive(context: Context, date: PureDate): Promise<HabitCategory> {
        const habitCategory = await HabitCategoryDao.getActive();
        if (!habitCategory) {
            throw new ServiceException(
                404,
                Code.HABIT_CATEGORY_NOT_FOUND,
                'habit category not found'
            );
        }

        const habitCategoryModels: HabitCategory = ModelConverter.convert(habitCategory);
        const populatedHabitCategoryModel = await HabitCategoryService.populateMyHabitCategory(
            context,
            habitCategoryModels,
            date
        );

        return populatedHabitCategoryModel;
    }

    private static async populateRecentHabitCategory(
        context: Context,
        activeHabitCategory: HabitCategory
    ): Promise<HabitCategory> {
        const scheduledHabits = await ScheduledHabitService.getRecent(context.userId);
        activeHabitCategory.tasks = this.populateHabitCategoryTasks(scheduledHabits);
        return activeHabitCategory;
    }

    private static async populateMyHabitCategory(
        context: Context,
        activeHabitCategory: HabitCategory,
        date: PureDate
    ): Promise<HabitCategory> {
        const scheduledHabits = await ScheduledHabitService.getActive(context.userId, date);
        activeHabitCategory.tasks = this.populateHabitCategoryTasks(scheduledHabits);
        return activeHabitCategory;
    }

    private static populateHabitCategoryTasks(scheduledHabits: ScheduledHabit[]) {
        const uniqueTasks: Task[] = [];
        scheduledHabits.forEach((scheduledHabit) => {
            const task = scheduledHabit.task;
            if (!task) {
                return;
            }

            if (!uniqueTasks.find((uniqueTask) => uniqueTask.id === task.id)) {
                uniqueTasks.push(task);
            }
        });
        return uniqueTasks;
    }
}
