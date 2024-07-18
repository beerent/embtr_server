import { Context } from '@src/general/auth/Context';
import { PointLedgerRecordService } from './PointLedgerRecordService';
import { UserPropertyService } from './UserPropertyService';

export class PointLedgerService {
    public static async recalculatePoints(context: Context) {
        const totalPoints = await this.totalPoints(context);
        await UserPropertyService.setPoints(context, totalPoints);

        // emit points updated event
    }

    public static async totalPoints(context: Context): Promise<number> {
        const [addPoints, subtractPoints] = await Promise.all([
            PointLedgerRecordService.sumAddRecords(context),
            PointLedgerRecordService.sumSubtractRecord(context),
        ]);

        const points = addPoints - subtractPoints;
        return points;
    }
}
