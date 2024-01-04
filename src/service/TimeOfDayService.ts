import { SUCCESS, GENERAL_FAILURE } from '@src/common/RequestResponses';
import { TimeOfDay} from '@resources/schema';
import { GetTimesOfDayResponse } from '@resources/types/requests/TimeOfDayTypes';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { TimeOfDayDao } from '@src/database/TimeOfDayDao';

export class TimeOfDayService {
    public static async getAll(): Promise<GetTimesOfDayResponse> {
        const timesOfDay = await TimeOfDayDao.getAll();
        if (!timesOfDay) {
            return { ...GENERAL_FAILURE, message: 'Times of day not found' };
        }

        const models: TimeOfDay[] = ModelConverter.convertAll(timesOfDay);
        return { ...SUCCESS, timesOfDay: models };
    }
}
