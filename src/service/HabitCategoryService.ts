import { HabitCategory, ScheduledHabit, Task } from '@resources/schema';
import {
    GetHabitCategoriesResponse,
    GetHabitCategoryResponse,
} from '@resources/types/requests/HabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { HabitCategoryController } from '@src/controller/HabitCategoryController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ScheduledHabitService } from './ScheduledHabitService';
import { Request } from 'express';
import { ContextService } from './ContextService';
import { Context } from '@src/general/auth/Context';
import { PureDate } from '@resources/types/date/PureDate';

export class HabitCategoryService {
    public static async getAllGeneric(request: Request): Promise<GetHabitCategoriesResponse> {
        const context = await ContextService.get(request);
        if (!context) {
            return { ...GENERAL_FAILURE, habitCategories: [] };
        }

        const genericHabitCategories = await HabitCategoryController.getAllGeneric();
        const genericHabitCategoriesModels =
            ModelConverter.convertAll<HabitCategory>(genericHabitCategories);

        return { ...SUCCESS, habitCategories: genericHabitCategoriesModels };
    }

    public static async getCustom(request: Request): Promise<GetHabitCategoryResponse> {
        const context = await ContextService.get(request);
        if (!context) {
            return { ...GENERAL_FAILURE };
        }

        const customHabitsCategory = await HabitCategoryController.getCustom(context.userId);
        if (!customHabitsCategory) {
            return { ...GENERAL_FAILURE };
        }

        const customHabitModels = ModelConverter.convert<HabitCategory>(customHabitsCategory);
        return { ...SUCCESS, habitCategory: customHabitModels };
    }

    public static async getRecent(request: Request): Promise<GetHabitCategoryResponse> {
        const context = await ContextService.get(request);
        if (!context) {
            return { ...GENERAL_FAILURE };
        }

        const recentHabitsCategory = await HabitCategoryController.getRecent();
        if (!recentHabitsCategory) {
            return { ...GENERAL_FAILURE };
        }

        const recentHabitCategoryModel: HabitCategory =
            ModelConverter.convert(recentHabitsCategory);
        const populatedRecentHabitsCategory =
            await HabitCategoryService.populateRecentHabitCategory(
                context,
                recentHabitCategoryModel
            );

        return { ...SUCCESS, habitCategory: populatedRecentHabitsCategory };
    }

    public static async getActive(
        context: Context,
        date: PureDate
    ): Promise<GetHabitCategoryResponse> {
        const activeHabitsCategory = await HabitCategoryController.getActive();
        if (!activeHabitsCategory) {
            return { ...GENERAL_FAILURE };
        }

        const activeHabitsCategoryModel: HabitCategory =
            ModelConverter.convert(activeHabitsCategory);
        const populatedActiveHabitsCategoryModel =
            await HabitCategoryService.populateMyHabitCategory(
                context,
                activeHabitsCategoryModel,
                date
            );

        return { ...SUCCESS, habitCategory: populatedActiveHabitsCategoryModel };
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
