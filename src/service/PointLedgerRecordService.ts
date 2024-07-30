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
import { PureDate } from '@resources/types/date/PureDate';

export class PointLedgerRecordService {
    public static async addHabitComplete(
        context: Context,
        habitId: number,
        totalTimesOfDay: number
    ) {
        if (!this.canAddPoints(context)) {
            return;
        }

        await this.upsertPointsAddedLedgerRecord(
            context,
            habitId,
            Constants.PointDefinitionType.HABIT_COMPLETE,
            totalTimesOfDay
        );
    }

    public static async subtractHabitComplete(context: Context, habitId: number) {
        if (!this.canAddPoints(context)) {
            return;
        }

        await this.upsertPointsRemovedLedgerRecord(
            context,
            habitId,
            Constants.PointDefinitionType.HABIT_COMPLETE
        );
    }

    public static async addDayComplete(context: Context, dayId: number) {
        if (!this.canAddPoints(context)) {
            return;
        }

        await this.upsertPointsAddedLedgerRecord(
            context,
            dayId,
            Constants.PointDefinitionType.DAY_COMPLETE
        );
    }

    public static async subtractDayComplete(context: Context, dayId: number) {
        if (!this.canAddPoints(context)) {
            return;
        }

        await this.upsertPointsRemovedLedgerRecord(
            context,
            dayId,
            Constants.PointDefinitionType.DAY_COMPLETE
        );
    }

    public static async addPlannedDayResultCreated(context: Context, plannedDayResultId: number) {
        if (!this.canAddPoints(context)) {
            return;
        }

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
        if (!this.canAddPoints(context)) {
            return;
        }

        await this.upsertPointsRemovedLedgerRecord(
            context,
            plannedDayResultId,
            Constants.PointDefinitionType.PLANNED_DAY_RESULT_CREATED
        );
    }

    public static async sumLedgerRecords(context: Context): Promise<number> {
        const points = await PointLedgerRecordDao.sumPointsByUser(context.userId);
        return points._sum.points ?? 0;
    }

    private static async upsertPointsAddedLedgerRecord(
        context: Context,
        relevantId: number,
        pointDefinitionType: Constants.PointDefinitionType,
        pointsSplit?: number
    ) {
        const latestPointDefinitionVersion = await PointDefinitionService.getLatestVersion(
            context,
            pointDefinitionType
        );

        if (!latestPointDefinitionVersion?.points || !latestPointDefinitionVersion?.version) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'Failed to get latest point definition version'
            );
        }

        console.log(
            `Adding ${latestPointDefinitionVersion.points} points for ${pointDefinitionType} on ${relevantId} with pointsSplit ${pointsSplit}`
        );

        return this.upsertPointsLedgerRecord(
            context,
            relevantId,
            pointDefinitionType,
            latestPointDefinitionVersion.points / (pointsSplit ?? 1)
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

    // TODO remove after august 1, 2024
    private static async canAddPoints(context: Context) {
        const clientDate = PureDate.fromString(context.dayKey);
        const cutoffDate = PureDate.fromString('2024-08-01');

        console.log(`Client date: ${clientDate}, cutoff date: ${cutoffDate}`);

        return clientDate >= cutoffDate;
    }
}
