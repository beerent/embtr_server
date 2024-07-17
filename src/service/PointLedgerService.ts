import { Context } from '@src/general/auth/Context';
import { PointLedgerRecordService } from './PointLedgerRecordService';
import { UserPropertyService } from './UserPropertyService';
import { WebSocketService } from './WebSocketService';

export class PointLedgerService {
    public static async recalculatePoints(context: Context) {
        const totalPoints = await this.totalPoints(context);
        console.log('Total points:', totalPoints);
        await UserPropertyService.setPoints(context, totalPoints);
    }

    public static async totalPoints(context: Context): Promise<number> {
        const [addPoints, subtractPoints] = await Promise.all([
            PointLedgerRecordService.sumAddRecords(context),
            PointLedgerRecordService.sumSubtractRecord(context),
        ]);

        const points = addPoints - subtractPoints;

        WebSocketService.emitPointsUpdated(context, points);
        return points;
    }
}
