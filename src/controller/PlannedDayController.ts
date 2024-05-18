import { Code } from '@resources/codes';
import { PlannedDay } from '@resources/schema';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { PlannedDayService } from '@src/service/PlannedDayService';

export class PlannedDayController {
    public static async getByUser(
        context: Context,
        userId: number,
        dayKey: string
    ): Promise<PlannedDay> {
        const plannedDay = await PlannedDayService.getFullyPopulatedByUser(context, userId, dayKey);
        if (!plannedDay) {
            throw new ServiceException(404, Code.PLANNED_DAY_NOT_FOUND, 'planned day not found');
        }

        return plannedDay;
    }
}
