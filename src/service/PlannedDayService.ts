import { GetPlannedDayResponse } from '@resources/types';
import { GET_PLANNED_DAY_FAILED_NOT_FOUND, GET_PLANNED_DAY_SUCCESS, GET_TASK_FAILED_NOT_FOUND } from '@src/common/RequestResponses';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PlannedDayService {
    public static async get(id: string | number): Promise<GetPlannedDayResponse> {
        if (isNaN(Number(id))) {
            return GET_PLANNED_DAY_FAILED_NOT_FOUND;
        }

        const plannedDay = await PlannedDayController.get(Number(id));

        if (plannedDay) {
            const convertedPlannedDay = ModelConverter.convertPlannedDay(plannedDay);
            return { ...GET_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
        }

        return GET_TASK_FAILED_NOT_FOUND;
    }
}
