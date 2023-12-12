import { HabitCategory, Task } from '@resources/schema';
import { GetHabitCategoriesResponse } from '@resources/types/requests/HabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { HabitCategoryController } from '@src/controller/HabitCategoryController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ScheduledHabitService } from './ScheduledHabitService';
import { Request } from 'express';
import { ContextService } from './ContextService';
import { Context } from '@src/general/auth/Context';

export class HabitCategoryService {
    public static async getAll(request: Request): Promise<GetHabitCategoriesResponse> {
        const context = await ContextService.get(request);
        if (!context) {
            return { ...GENERAL_FAILURE, habitCategories: [] };
        }

        const categories = await HabitCategoryController.getAll();
        if (!categories) {
            return { ...SUCCESS, habitCategories: [] };
        }

        let categoryModels: HabitCategory[] = ModelConverter.convertAll(categories);
        categoryModels = await HabitCategoryService.setRecentHabitCategory(context, categoryModels);

        return { ...SUCCESS, habitCategories: categoryModels };
    }

    private static async setRecentHabitCategory(
        context: Context,
        categories: HabitCategory[]
    ): Promise<HabitCategory[]> {
        // 1. find recent habit category
        const recentHabitCategory = categories.find(
            (category) => category.name === 'Recent Habits'
        );
        if (!recentHabitCategory) {
            return categories;
        }

        // 2. populate recent habit category
        const populatedRecentHabitCategory = await HabitCategoryService.populateRecentHabitCategory(
            context,
            recentHabitCategory
        );

        // 3. replace old with new
        const recentIndex = categories.findIndex(
            (category) => category.name === recentHabitCategory.name
        );
        categories[recentIndex] = populatedRecentHabitCategory;

        return categories;
    }

    private static async populateRecentHabitCategory(
        context: Context,
        activeHabitCategory: HabitCategory
    ): Promise<HabitCategory> {
        const scheduledHabits = await ScheduledHabitService.getRecent(context.userId);
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

        activeHabitCategory.tasks = uniqueTasks;
        return activeHabitCategory;
    }
}
