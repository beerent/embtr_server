import { PlannedDayResultModel } from '@resources/models/PlannedDayResultModel';
import {
    CreatePlannedDayResultRequest,
    GetPlannedDayResultRequest,
    GetPlannedDayResultResponse,
    GetPlannedDayResultsResponse,
} from '@resources/types/PlannedDayResultTypes';
import { CREATE_DAY_RESULT_FAILED, GET_DAY_RESULT_UNKNOWN, SUCCESS } from '@src/common/RequestResponses';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';

export class PlannedDayResultService {
    public static async create(request: CreatePlannedDayResultRequest): Promise<GetPlannedDayResultResponse> {
        const plannedDay = await PlannedDayController.get(request.plannedDayId);
        if (!plannedDay) {
            return CREATE_DAY_RESULT_FAILED;
        }

        const createdDayResult = await PlannedDayResultController.create(request.plannedDayId);

        if (createdDayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convertDayResult(createdDayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getAll(): Promise<GetPlannedDayResultsResponse> {
        const dayResults = await PlannedDayResultController.getAll();

        if (dayResults) {
            const convertedDayResults: PlannedDayResultModel[] = ModelConverter.convertDayResults(dayResults);
            return { ...SUCCESS, dayResults: convertedDayResults };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getById(id: number): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultController.getById(id);

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convertDayResult(dayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getByUserAndDayKey(request: GetPlannedDayResultRequest): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultController.getByUserAndDayKey(request.userId, request.dayKey);

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convertDayResult(dayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }
}
