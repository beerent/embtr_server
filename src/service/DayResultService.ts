import { DayResultModel } from '@resources/models/DayResultModel';
import { CreateDayResultRequest, GetDayResultRequest, GetDayResultResponse, GetDayResultsResponse } from '@resources/types/DayResultTypes';
import { CREATE_DAY_RESULT_FAILED, GET_DAY_RESULT_UNKNOWN, SUCCESS } from '@src/common/RequestResponses';
import { DayResultController } from '@src/controller/DayResultController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { PlannedDayService } from './PlannedDayService';
import { PlannedDayController } from '@src/controller/PlannedDayController';

export class DayResultService {
    public static async create(request: CreateDayResultRequest): Promise<GetDayResultResponse> {
        const plannedDay = await PlannedDayController.get(request.plannedDayId);
        if (!plannedDay) {
            return CREATE_DAY_RESULT_FAILED;
        }

        const createdDayResult = await DayResultController.create(request.plannedDayId);

        if (createdDayResult) {
            const convertedDayResult: DayResultModel = ModelConverter.convertDayResult(createdDayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getAll(): Promise<GetDayResultsResponse> {
        const dayResults = await DayResultController.getAll();

        if (dayResults) {
            const convertedDayResults: DayResultModel[] = ModelConverter.convertDayResults(dayResults);
            return { ...SUCCESS, dayResults: convertedDayResults };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getById(id: number): Promise<GetDayResultResponse> {
        const dayResult = await DayResultController.getById(id);

        if (dayResult) {
            const convertedDayResult: DayResultModel = ModelConverter.convertDayResult(dayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getByUserAndDayKey(request: GetDayResultRequest): Promise<GetDayResultResponse> {
        const dayResult = await DayResultController.getByUserAndDayKey(request.userId, request.dayKey);

        if (dayResult) {
            const convertedDayResult: DayResultModel = ModelConverter.convertDayResult(dayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }
}
