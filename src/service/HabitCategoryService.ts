import { HabitCategory } from '@resources/schema';
import { GetHabitCategoriesResponse } from '@resources/types/requests/HabitTypes';
import { CreateScheduledHabitRequest } from '@resources/types/requests/ScheduledHabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { HabitCategoryController } from '@src/controller/HabitCategoryController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

export class HabitCategoryService {
    public static async getAll(): Promise<GetHabitCategoriesResponse> {
        const categories = await HabitCategoryController.getAll();
        if (!categories) {
            return { ...SUCCESS, habitCategories: [] };
        }

        const categoryModels: HabitCategory[] = ModelConverter.convertAll(categories);
        return { ...SUCCESS, habitCategories: categoryModels };
    }
}
