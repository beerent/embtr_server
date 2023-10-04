import { SUCCESS, GENERAL_FAILURE } from '@src/common/RequestResponses';
import { DayOfWeek } from '@resources/schema';
import { GetDaysOfWeekResponse } from '@resources/types/requests/DayOfWeekTypes';
import { DayOfWeekController } from '@src/controller/DayOfWeekController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class DayOfWeekService {
    public static async getAll(): Promise<GetDaysOfWeekResponse> {
        const daysOfWeek = await DayOfWeekController.getAll();
        if (!daysOfWeek) {
            return { ...GENERAL_FAILURE, message: 'Days of week not found' };
        }

        const models: DayOfWeek[] = ModelConverter.convertAll(daysOfWeek);
        return { ...SUCCESS, daysOfWeek: models };
    }
}
