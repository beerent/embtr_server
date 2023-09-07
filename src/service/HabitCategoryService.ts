import { HabitCategory } from '@resources/schema';
import { GetHabitCategoriesResponse } from '@resources/types/requests/HabitTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { HabitCategoryController } from '@src/controller/HabitCategoryController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

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
