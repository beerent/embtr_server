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
        dayKey: string,
        totalTimesOfDay: number
    ) {
        if (!this.shouldAddPoints(dayKey)) {
            return;
        }

        await this.upsertPointsAddedLedgerRecord(
            context,
            dayKey,
            habitId,
            Constants.PointDefinitionType.HABIT_COMPLETE,
            totalTimesOfDay
        );
    }

    public static async subtractHabitComplete(context: Context, habitId: number, dayKey: string) {
        if (!this.shouldAddPoints(dayKey)) {
            return;
        }

        await this.upsertPointsRemovedLedgerRecord(
            context,
            dayKey,
            habitId,
            Constants.PointDefinitionType.HABIT_COMPLETE
        );
    }

    public static async addDayComplete(context: Context, dayId: number, dayKey: string) {
        if (!this.shouldAddPoints(dayKey)) {
            return;
        }

        await this.upsertPointsAddedLedgerRecord(
            context,
            dayKey,
            dayId,
            Constants.PointDefinitionType.DAY_COMPLETE
        );
    }

    public static async subtractDayComplete(context: Context, dayId: number, dayKey: string) {
        if (!this.shouldAddPoints(dayKey)) {
            return;
        }

        await this.upsertPointsRemovedLedgerRecord(
            context,
            dayKey,
            dayId,
            Constants.PointDefinitionType.DAY_COMPLETE
        );
    }

    public static async addPlannedDayResultCreated(
        context: Context,
        plannedDayResultId: number,
        dayKey: string
    ) {
        if (!this.shouldAddPoints(dayKey)) {
            return;
        }

        await this.upsertPointsAddedLedgerRecord(
            context,
            dayKey,
            plannedDayResultId,
            Constants.PointDefinitionType.PLANNED_DAY_RESULT_CREATED
        );
    }

    public static async subtractPlannedDayResultCreated(
        context: Context,
        plannedDayResultId: number,
        dayKey: string
    ) {
        if (!this.shouldAddPoints(dayKey)) {
            return;
        }

        await this.upsertPointsRemovedLedgerRecord(
            context,
            dayKey,
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
        dayKey: string,
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
            dayKey,
            relevantId,
            pointDefinitionType,
            latestPointDefinitionVersion.points / (pointsSplit ?? 1)
        );
    }

    private static async upsertPointsRemovedLedgerRecord(
        context: Context,
        dayKey: string,
        relevantId: number,
        pointDefinitionType: Constants.PointDefinitionType
    ) {
        console.log(`Removing points for ${pointDefinitionType} on ${relevantId}`);
        return this.upsertPointsLedgerRecord(context, dayKey, relevantId, pointDefinitionType, 0);
    }

    private static async upsertPointsLedgerRecord(
        context: Context,
        dayKey: string,
        relevantId: number,
        pointDefinitionType: Constants.PointDefinitionType,
        points: number
    ) {
        const pointLedgerRecord = await PointLedgerRecordDao.upsert(
            context.userId,
            dayKey,
            relevantId,
            pointDefinitionType,
            points
        );

        const pointLedgerRecordModel: PointLedgerRecord = ModelConverter.convert(pointLedgerRecord);
        PointLedgerRecordDispatcher.onUpdated(context, relevantId, pointDefinitionType, points);

        return pointLedgerRecordModel;
    }

    private static shouldAddPoints(dayKey: string) {
        const clientDate = PureDate.fromString(dayKey);
        const serverDate = PureDate.fromString('2024-08-01');

        return clientDate >= serverDate;
    }
}
