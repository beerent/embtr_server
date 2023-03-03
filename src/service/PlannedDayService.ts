import { CreatePlannedDayRequest, CreatePlannedDayResponse, GetPlannedDayResponse } from '@resources/types';
import {
    CREATE_PLANNED_DAY_FAILED,
    CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS,
    CREATE_PLANNED_DAY_SUCCESS,
    GENERAL_FAILURE,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    GET_PLANNED_DAY_SUCCESS,
} from '@src/common/RequestResponses';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { DayKeyUtility } from '@src/utility/date/DayKeyUtility';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PlannedDayService {
    public static async get(id: string | number): Promise<GetPlannedDayResponse> {
        if (isNaN(Number(id))) {
            return GET_PLANNED_DAY_FAILED_NOT_FOUND;
        }

        const plannedDay = await PlannedDayController.get(Number(id));

        if (plannedDay) {
            const convertedPlannedDay = ModelConverter.convertPlannedDayWithUser(plannedDay);
            return { ...GET_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
        }

        return GET_PLANNED_DAY_FAILED_NOT_FOUND;
    }

    public static async create(request: CreatePlannedDayRequest): Promise<CreatePlannedDayResponse> {
        if (!request.dayKey || !request.userId) {
            return { ...GENERAL_FAILURE, message: 'Missing required fields' };
        }

        const date = new Date(request.dayKey);

        const preExistingDayKey = await PlannedDayController.getByUserAndDayKey(request.userId, request.dayKey);
        if (preExistingDayKey) {
            return CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS;
        }

        const createdPlannedDay = await PlannedDayController.create(request.userId, date, request.dayKey);
        if (createdPlannedDay) {
            return CREATE_PLANNED_DAY_SUCCESS;
        }

        return CREATE_PLANNED_DAY_FAILED;
    }
}
