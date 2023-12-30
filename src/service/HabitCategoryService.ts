import { HabitCategory, ScheduledHabit, Task } from '@resources/schema';
import { GetHabitCategoriesResponse } from '@resources/types/requests/HabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import {
    HabitCategoryController,
    HabitCategoryPrisma,
} from '@src/controller/HabitCategoryController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ScheduledHabitService } from './ScheduledHabitService';
import { Request } from 'express';
import { ContextService } from './ContextService';
import { Context } from '@src/general/auth/Context';

export const RECENT_HABIT_CATEGORY_ID = 14;
export const MY_HABIT_CATEGORY_ID = 15;

export class HabitCategoryService {
    public static async getAll(request: Request): Promise<GetHabitCategoriesResponse> {
        const context = await ContextService.get(request);
        if (!context) {
            return { ...GENERAL_FAILURE, habitCategories: [] };
        }

        let categoryModels: HabitCategory[] = [];
        const getGenericHabits = HabitCategoryController.getGenericHabits();
        const getCustomHabits = HabitCategoryController.getCustomHabits(context.userId);
        const getRecentHabits = HabitCategoryService.getRecentHabitsCategory(context);
        const getMyHabits = HabitCategoryService.getMyHabitsCategory(context);

        await Promise.all([getGenericHabits, getCustomHabits, getRecentHabits, getMyHabits]).then(
            (values) => {
                const allCategories: HabitCategoryPrisma = [...values[0], ...values[1]];
                categoryModels = ModelConverter.convertAll<HabitCategory>(allCategories);
                if (values[2]) {
                    categoryModels.push(values[2]);
                }
                if (values[3]) {
                    categoryModels.push(values[3]);
                }

                categoryModels.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            }
        );

        return { ...SUCCESS, habitCategories: categoryModels };
    }

    private static async getRecentHabitsCategory(
        context: Context
    ): Promise<HabitCategory | undefined> {
        const recentHabitCategory = await HabitCategoryController.getById(RECENT_HABIT_CATEGORY_ID);
        if (!recentHabitCategory) {
            return undefined;
        }

        const recentHabitCategoryModel: HabitCategory = ModelConverter.convert(recentHabitCategory);
        return HabitCategoryService.populateRecentHabitCategory(context, recentHabitCategoryModel);
    }

    private static async getMyHabitsCategory(context: Context): Promise<HabitCategory | undefined> {
        const myHabitCategory = await HabitCategoryController.getById(MY_HABIT_CATEGORY_ID);
        if (!myHabitCategory) {
            return undefined;
        }

        const myHabitCategoryModel: HabitCategory = ModelConverter.convert(myHabitCategory);
        return HabitCategoryService.populateMyHabitCategory(context, myHabitCategoryModel);
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
        activeHabitCategory: HabitCategory
    ): Promise<HabitCategory> {
        const scheduledHabits = await ScheduledHabitService.getActive(context.userId);
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
