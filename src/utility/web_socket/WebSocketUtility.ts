import { Constants } from '@resources/types/constants/constants';
import { Context } from '@src/general/auth/Context';
import { WebSocketService } from '@src/service/WebSocketService';

export class WebSocketUtility {
    public static emitPlannedDay(
        context: Context,
        dayKey: string,
        pointDefinitionType: Constants.PointDefinitionType,
        points: number
    ) {
        switch (pointDefinitionType) {
            case Constants.PointDefinitionType.DAY_COMPLETE:
                this.emitLevelDetailsUpdated(context, dayKey, points);
        }
    }

    private static async emitLevelDetailsUpdated(context: Context, dayKey: string, points: number) {
        if (points > 0) {
            WebSocketService.emitPlannedDayComplete(context, dayKey);
        } else {
            WebSocketService.emitPlannedDayIncomplete(context, dayKey);
        }
    }
}
