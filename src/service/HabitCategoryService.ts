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
        categoryModels = await HabitCategoryService.setActiveHabitCategory(context, categoryModels);

        return { ...SUCCESS, habitCategories: categoryModels };
    }

    private static async setActiveHabitCategory(
        context: Context,
        categories: HabitCategory[]
    ): Promise<HabitCategory[]> {
        // 1. find active habit category
        const activeHabitCategory = categories.find(
            (category) => category.name === 'Active Habits'
        );
        if (!activeHabitCategory) {
            return categories;
        }

        // 2. populate active habit category
        const populatedActiveHabitCategory = await HabitCategoryService.populateActiveHabitCategory(
            context,
            activeHabitCategory
        );

        // 3. replace old with new
        const activeIndex = categories.findIndex(
            (category) => category.name === activeHabitCategory.name
        );
        categories[activeIndex] = populatedActiveHabitCategory;

        return categories;
    }

    private static async populateActiveHabitCategory(
        context: Context,
        activeHabitCategory: HabitCategory
    ): Promise<HabitCategory> {
        const scheduledHabits = await ScheduledHabitService.getActive(context.userId);
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
