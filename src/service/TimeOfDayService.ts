import { SUCCESS, GENERAL_FAILURE } from '@src/common/RequestResponses';
import { TimeOfDay } from '@resources/schema';
import { GetTimesOfDayResponse } from '@resources/types/requests/TimeOfDayTypes';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { TimeOfDayDao } from '@src/database/TimeOfDayDao';
import { Context } from '@src/general/auth/Context';
import { Code } from '@resources/codes';
import { ServiceException } from '@src/general/exception/ServiceException';

export class TimeOfDayService {
    public static async getAll(context: Context): Promise<TimeOfDay[]> {
        const timesOfDay = await TimeOfDayDao.getAll();
        if (!timesOfDay) {
            throw new ServiceException(404, Code.TIME_OF_DAY_NOT_FOUND, 'times of day not found');
        }

        const timeOfDayModels: TimeOfDay[] = ModelConverter.convertAll(timesOfDay);
        return timeOfDayModels;
    }
}
