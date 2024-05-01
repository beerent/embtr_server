import { PlannedDayResult } from '@resources/schema';
import { Context } from '@src/general/auth/Context';

export class PlannedDayResultTransformationServiceV2 {
    public static transformIn(context: Context, plannedDayId: number): PlannedDayResult {
        const plannedDayResult: PlannedDayResult = {
            plannedDayId,
        };

        return plannedDayResult;
    }
}
