import { Habit } from '@resources/schema';
import { GetAllHabitResonse } from '@resources/types/requests/HabitTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { HabitController } from '@src/controller/HabitController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class HabitService {
    static async getAll(): Promise<GetAllHabitResonse> {
        const habits = await HabitController.getAll();
        const habitModels: Habit[] = ModelConverter.convertAll(habits);

        return { ...SUCCESS, habits: habitModels };
    }
}
