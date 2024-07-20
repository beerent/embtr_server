import { Context } from '@src/general/auth/Context';
import { PointLedgerRecordService } from './PointLedgerRecordService';
import { UserPropertyService } from './UserPropertyService';

export class PointLedgerService {
    public static async recalculatePoints(context: Context) {
        const totalPoints = await PointLedgerRecordService.sumLedgerRecords(context);
        return UserPropertyService.setPoints(context, totalPoints);
    }
}
