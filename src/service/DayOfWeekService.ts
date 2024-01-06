import { DayOfWeek } from '@resources/schema';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { DayOfWeekDao } from '@src/database/DayOfWeekDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';

export class DayOfWeekService {
    public static async getAll(context: Context): Promise<DayOfWeek[]> {
        const daysOfWeek = await DayOfWeekDao.getAll();
        if (!daysOfWeek) {
            throw new ServiceException(404, Code.DAY_OF_WEEK_NOT_FOUND, 'Days of week not found');
        }

        const dayOfWeekModels: DayOfWeek[] = ModelConverter.convertAll(daysOfWeek);
        return dayOfWeekModels;
    }
}
