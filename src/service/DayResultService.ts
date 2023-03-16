import { DayResultModel } from '@resources/models/DayResultModel';
import { GetDayResultRequest, GetDayResultResponse } from '@resources/types/DayResultTypes';
import { GET_DAY_RESULT_UNKNOWN, SUCCESS } from '@src/common/RequestResponses';
import { DayResultController } from '@src/controller/DayResultController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class DayResultService {
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
