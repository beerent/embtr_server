import { PlannedTask } from '@resources/schema';
import { GetPlannedHabitResponse } from '@resources/types/requests/PlannedTaskTypes';
import {
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    GET_PLANNED_DAY_SUCCESS,
} from '@src/common/RequestResponses';
import { PlannedHabitController } from '@src/controller/PlannedHabitController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PlannedHabitService {
    public static async getById(id: number): Promise<GetPlannedHabitResponse> {
        const plannedHabit = await PlannedHabitController.get(id);
        if (!plannedHabit) {
            return GET_PLANNED_DAY_FAILED_NOT_FOUND;
        }

        const convertedPlannedHabit: PlannedTask = ModelConverter.convert(plannedHabit);
        return { ...GET_PLANNED_DAY_SUCCESS, plannedHabit: convertedPlannedHabit };
    }
}
