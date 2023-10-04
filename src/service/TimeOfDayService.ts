import { SUCCESS, GENERAL_FAILURE } from '@src/common/RequestResponses';
import { TimeOfDay} from '@resources/schema';
import { TimeOfDayController } from '@src/controller/TimeOfDayController';
import { GetTimesOfDayResponse } from '@resources/types/requests/TimeOfDayTypes';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class TimeOfDayService {
    public static async getAll(): Promise<GetTimesOfDayResponse> {
        const timesOfDay = await TimeOfDayController.getAll();
        if (!timesOfDay) {
            return { ...GENERAL_FAILURE, message: 'Times of day not found' };
        }

        const models: TimeOfDay[] = ModelConverter.convertAll(timesOfDay);
        return { ...SUCCESS, timesOfDay: models };
    }
}
