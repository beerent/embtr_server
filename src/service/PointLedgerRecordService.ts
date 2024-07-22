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
        await this.upsertPointsAddedLedgerRecord(
            context,
            habitId,
            Constants.PointDefinitionType.HABIT_COMPLETE
        );
    }

    public static async subtractHabitComplete(context: Context, habitId: number) {
        await this.upsertPointsRemovedLedgerRecord(
            context,
            habitId,
            Constants.PointDefinitionType.HABIT_COMPLETE
        );
    }

    public static async addDayComplete(context: Context, dayId: number) {
        await this.upsertPointsAddedLedgerRecord(
            context,
            dayId,
            Constants.PointDefinitionType.DAY_COMPLETE
        );
    }

    public static async subtractDayComplete(context: Context, dayId: number) {
        await this.upsertPointsRemovedLedgerRecord(
            context,
            dayId,
            Constants.PointDefinitionType.DAY_COMPLETE
        );
    }

    public static async addPlannedDayResultCreated(context: Context, plannedDayResultId: number) {
        await this.upsertPointsAddedLedgerRecord(
            context,
            plannedDayResultId,
            Constants.PointDefinitionType.PLANNED_DAY_RESULT_CREATED
        );
    }

    public static async subtractPlannedDayResultCreated(
        context: Context,
        plannedDayResultId: number
    ) {
        await this.upsertPointsRemovedLedgerRecord(
            context,
            plannedDayResultId,
            Constants.PointDefinitionType.PLANNED_DAY_RESULT_CREATED
        );
    }

    private static async upsertPointsAddedLedgerRecord(
        context: Context,
        relevantId: number,
        pointDefinitionType: Constants.PointDefinitionType
    ) {
        const latestPointDefinitionVersion =
            await PointDefinitionService.getLatestVersion(pointDefinitionType);

        if (!latestPointDefinitionVersion?.points || !latestPointDefinitionVersion?.version) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'Failed to get latest point definition version'
            );
        }

        return this.upsertPointsLedgerRecord(
            context,
            relevantId,
            pointDefinitionType,
            latestPointDefinitionVersion.points
        );
    }

    private static async upsertPointsRemovedLedgerRecord(
        context: Context,
        relevantId: number,
        pointDefinitionType: Constants.PointDefinitionType
    ) {
        return this.upsertPointsLedgerRecord(context, relevantId, pointDefinitionType, 0);
    }

    private static async upsertPointsLedgerRecord(
        context: Context,
        relevantId: number,
        pointDefinitionType: Constants.PointDefinitionType,
        points: number
    ) {
        const pointLedgerRecord = await PointLedgerRecordDao.upsert(
            context.userId,
            relevantId,
            pointDefinitionType,
            points
        );

        const pointLedgerRecordModel: PointLedgerRecord = ModelConverter.convert(pointLedgerRecord);
        PointLedgerRecordDispatcher.onUpdated(context);

        return pointLedgerRecordModel;
    }

    public static async sumLedgerRecords(context: Context): Promise<number> {
        const points = await PointLedgerRecordDao.sumPointsByUser(context.userId);
        return points._sum.points ?? 0;
    }
}
