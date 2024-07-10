import { Constants } from '@resources/types/constants/constants';
import { PointLedgerDao } from '@src/database/PointLedgerDao';
import { Context } from '@src/general/auth/Context';

export class PointLedgerService {
    public static async addHabitComplete(context: Context, habitId: number) {
        await this.addLedgerEntry(context, Constants.PointDefinition.HABIT_COMPLETE, habitId);
    }

    private static async addLedgerEntry(
        context: Context,
        pointDefinitionCategory: Constants.PointDefinition,
        relevantId?: number
    ) {
        console.log('Adding point ledger entry', pointDefinitionCategory, relevantId);
        PointLedgerDao.create(context.userId, pointDefinitionCategory, relevantId);
    }
}
