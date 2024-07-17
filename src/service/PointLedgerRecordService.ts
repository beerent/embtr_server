import { Code } from '@resources/codes';
import { Constants } from '@resources/types/constants/constants';
import { HttpCode } from '@src/common/RequestResponses';
import { PointLedgerRecordDao } from '@src/database/PointLedgerRecordDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { PointDefinitionService } from './PointDefinitionService';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { PointLedgerRecord } from '@resources/schema';
import { PointLedgerRecordDispatcher } from '@src/event/point/PointLedgerRecordEventDispatcher';

export class PointLedgerRecordService {
    public static async addHabitComplete(context: Context, habitId: number) {
        const ledgerRecord = await this.addLedgerRecord(
            context,
            Constants.PointDefinition.HABIT_COMPLETE,
            Constants.PointTransactionType.ADD,
            habitId
        );
    }

    public static async subtractHabitComplete(context: Context, habitId: number) {
        const ledgerRecord = await this.addLedgerRecord(
            context,
            Constants.PointDefinition.HABIT_COMPLETE,
            Constants.PointTransactionType.SUBTRACT,
            habitId
        );
    }

    public static async addDayComplete(context: Context, dayId: number) {
        const ledgerRecord = await this.addLedgerRecord(
            context,
            Constants.PointDefinition.DAY_COMPLETE,
            Constants.PointTransactionType.ADD,
            dayId
        );
    }

    public static async subtractDayComplete(context: Context, dayId: number) {
        const ledgerRecord = await this.addLedgerRecord(
            context,
            Constants.PointDefinition.DAY_COMPLETE,
            Constants.PointTransactionType.SUBTRACT,
            dayId
        );
    }

    public static async addPlannedDayResultCreated(context: Context, plannedDayResultId: number) {
        const ledgerRecord = await this.addLedgerRecord(
            context,
            Constants.PointDefinition.PLANNED_DAY_RESULT_CREATED,
            Constants.PointTransactionType.ADD,
            plannedDayResultId
        );
    }

    public static async subtractPlannedDayResultCreated(
        context: Context,
        plannedDayResultId: number
    ) {
        const ledgerRecord = await this.addLedgerRecord(
            context,
            Constants.PointDefinition.PLANNED_DAY_RESULT_CREATED,
            Constants.PointTransactionType.SUBTRACT,
            plannedDayResultId
        );
    }

    public static async sumAddRecords(context: Context): Promise<number> {
        return PointLedgerRecordDao.sumByTransactionType(
            context.userId,
            Constants.PointTransactionType.ADD
        );
    }

    public static async sumSubtractRecord(context: Context): Promise<number> {
        return PointLedgerRecordDao.sumByTransactionType(
            context.userId,
            Constants.PointTransactionType.SUBTRACT
        );
    }

    private static async addLedgerRecord(
        context: Context,
        pointDefinitionCategory: Constants.PointDefinition,
        transactionType: Constants.PointTransactionType,
        relevantId?: number
    ) {
        const latestPointDefinitionVersion =
            await PointDefinitionService.getLatestVersion(pointDefinitionCategory);

        if (!latestPointDefinitionVersion?.action || !latestPointDefinitionVersion?.version) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'Failed to get latest point definition version'
            );
        }

        const pointLedgerRecord = await PointLedgerRecordDao.create(
            context.userId,
            latestPointDefinitionVersion?.action,
            latestPointDefinitionVersion?.version,
            transactionType,
            relevantId
        );

        const pointLedgerRecordModel: PointLedgerRecord = ModelConverter.convert(pointLedgerRecord);

        PointLedgerRecordDispatcher.onUpdated(context);

        return pointLedgerRecordModel;
    }
}
