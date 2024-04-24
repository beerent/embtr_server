import {
    Challenge,
    ChallengeCalculationType,
    DayOfWeek,
    ScheduledHabit,
    TimeOfDay,
} from '@resources/schema';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Context } from '@src/general/auth/Context';
import { HabitSummary } from '@resources/types/habit/Habit';
import { PureDate } from '@resources/types/date/PureDate';
import { ScheduledHabitSummaryProvider } from '@src/provider/ScheduledHabitSummaryProvider';
import { ScheduledHabitDao } from '@src/database/ScheduledHabitDao';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { DateUtility } from '@src/utility/date/DateUtility';
import { PlannedHabitService } from './PlannedHabitService';
import { HttpCode } from '@src/common/RequestResponses';

export class ScheduledHabitService {
    public static async createOrUpdate(
        context: Context,
        scheduledHabit: ScheduledHabit
    ): Promise<ScheduledHabit> {
        if (scheduledHabit.id) {
            return this.replace(context, scheduledHabit);
        }

        return this.create(context, scheduledHabit);
    }

    public static async unarchiveFromChallenge(
        context: Context,
        challenge: Challenge
    ): Promise<ScheduledHabit[]> {
        const scheduledHabits: ScheduledHabit[] = [];

        for (const requirement of challenge.challengeRequirements ?? []) {
            const task = requirement.task;
            if (!task?.id) {
                continue;
            }

            const scheduledHabit = await this.getLatestVersionByTaskId(context, task.id);
            if (!scheduledHabit) {
                continue;
            }

            scheduledHabit.endDate = challenge.end ?? new Date();

            const updatedScheduledHabit = await this.update(context, scheduledHabit);
            scheduledHabits.push(updatedScheduledHabit);
        }

        return scheduledHabits;
    }

    public static async createFromChallenge(
        context: Context,
        challenge: Challenge
    ): Promise<ScheduledHabit[]> {
        const scheduledHabits: ScheduledHabit[] = [];

        for (const requirement of challenge.challengeRequirements ?? []) {
            const task = requirement.task;

            if (!task?.id) {
                throw new ServiceException(
                    HttpCode.RESOURCE_NOT_FOUND,
                    Code.RESOURCE_NOT_FOUND,
                    'failure creating scheduledHabit from challenge'
                );
            }

            const defaultTimeOfDay: TimeOfDay = {
                id: 5,
            };

            const defaultDaysOfWeek: DayOfWeek[] = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
                { id: 4 },
                { id: 5 },
                { id: 6 },
                { id: 7 },
            ];
            const clientDay: PureDate = PureDate.fromString(context.dayKey);
            const challengeStartDate: PureDate = PureDate.fromDateFromServer(
                challenge.start ?? new Date()
            );
            const challengeIsOlder = clientDay.compare(challengeStartDate) > 0;
            const startDate = challengeIsOlder
                ? clientDay.toUtcDate()
                : challengeStartDate.toUtcDate();

            const scheduledHabit: ScheduledHabit = {
                taskId: task?.id,
                quantity:
                    requirement.calculationType === ChallengeCalculationType.UNIQUE
                        ? requirement.requiredTaskQuantity
                        : 1,
                unitId: requirement.unitId,
                detailsEnabled: true,
                daysOfWeekEnabled: false,
                daysOfWeek: defaultDaysOfWeek,
                timesOfDayEnabled: false,
                timesOfDay: [defaultTimeOfDay],
                startDate: startDate,
                //TODO THIS DOES NOT POPULATE
                endDate: challenge.end,
            };

            const createdScheduledHabit = await this.create(context, scheduledHabit);
            scheduledHabits.push(createdScheduledHabit);
        }

        return scheduledHabits;
    }

    public static async create(
        context: Context,
        scheduledHabit: ScheduledHabit
    ): Promise<ScheduledHabit> {
        const createdScheduledHabit = await ScheduledHabitDao.create(
            context.userId,
            scheduledHabit
        );

        const createdScheduledHabitModel: ScheduledHabit =
            ModelConverter.convert(createdScheduledHabit);
        return createdScheduledHabitModel;
    }

    public static async update(
        context: Context,
        scheduledHabit: ScheduledHabit
    ): Promise<ScheduledHabit> {
        if (!scheduledHabit.id) {
            throw new ServiceException(400, Code.INVALID_REQUEST, 'invalid request');
        }

        const existingScheduledHabit = await ScheduledHabitDao.get(scheduledHabit.id);
        if (!existingScheduledHabit) {
            throw new ServiceException(
                404,
                Code.SCHEDULED_HABIT_NOT_FOUND,
                'scheduled habit not found'
            );
        }

        if (context.userId !== existingScheduledHabit.userId) {
            throw new ServiceException(403, Code.UNAUTHORIZED, 'unauthorized');
        }

        const updatedScheduledHabit = await ScheduledHabitDao.update(
            context.userId,
            scheduledHabit
        );

        const updatedScheduledHabitModel: ScheduledHabit =
            ModelConverter.convert(updatedScheduledHabit);

        return updatedScheduledHabitModel;
    }

    public static async replace(
        context: Context,
        scheduledHabit: ScheduledHabit
    ): Promise<ScheduledHabit> {
        if (!scheduledHabit.id) {
            throw new ServiceException(400, Code.INVALID_REQUEST, 'invalid request');
        }

        const existingScheduledHabit = await ScheduledHabitDao.get(scheduledHabit.id);
        if (!existingScheduledHabit) {
            throw new ServiceException(
                404,
                Code.SCHEDULED_HABIT_NOT_FOUND,
                'scheduled habit not found'
            );
        }

        const existingScheduledHabitModel: ScheduledHabit =
            ModelConverter.convert(existingScheduledHabit);

        const clientDayKey = context.dayKey;
        const clientDayKeyDate = DateUtility.getDate(clientDayKey);

        const isModified = await PlannedHabitService.existsByDayKeyAndScheduledHabitId(
            context,
            context.dayKey,
            scheduledHabit.id
        );

        let endDate = DateUtility.getDayBefore(clientDayKeyDate);
        let newStartDate = clientDayKeyDate;
        if (isModified) {
            newStartDate = DateUtility.getDayAfter(clientDayKeyDate);
        }

        // 1. set end date on current scheduled habit
        existingScheduledHabitModel.endDate = endDate;

        // 2. create new scheduled habit with updated values and dates
        const updatedScheduledHabitModal: ScheduledHabit = {
            ...existingScheduledHabitModel,
            ...scheduledHabit,
        };
        updatedScheduledHabitModal.startDate = newStartDate;
        updatedScheduledHabitModal.endDate = undefined;

        const promises = [
            ScheduledHabitDao.update(context.userId, existingScheduledHabitModel),
            ScheduledHabitDao.create(context.userId, updatedScheduledHabitModal),
        ];

        const [_, updatedScheduledHabit] = await Promise.all(promises);

        const updatedScheduledHabitModel: ScheduledHabit =
            ModelConverter.convert(updatedScheduledHabit);

        return updatedScheduledHabitModel;
    }

    public static async getAllByHabit(
        context: Context,
        habitId: number
    ): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitDao.getAllByHabitIdAndUserId(
            habitId,
            context.userId
        );
        if (!scheduledHabits) {
            throw new ServiceException(
                404,
                Code.SCHEDULED_HABIT_NOT_FOUND,
                'scheduled habit not found'
            );
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async get(context: Context, id: number): Promise<ScheduledHabit> {
        const scheduledHabit = await ScheduledHabitDao.get(id);
        if (!scheduledHabit) {
            throw new ServiceException(
                404,
                Code.SCHEDULED_HABIT_NOT_FOUND,
                'scheduled habit not found'
            );
        }

        const scheduledHabitModel: ScheduledHabit = ModelConverter.convert(scheduledHabit);
        return scheduledHabitModel;
    }

    public static async getRecent(userId: number): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitDao.getRecent(userId);
        if (!scheduledHabits) {
            return [];
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async getPast(context: Context, date: PureDate): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitDao.getPast(context.userId, date);
        if (!scheduledHabits) {
            return [];
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async getActive(context: Context, date: PureDate): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitDao.getActive(context.userId, date);
        if (!scheduledHabits) {
            return [];
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async getFuture(context: Context, date: PureDate): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitDao.getFuture(context.userId, date);
        if (!scheduledHabits) {
            return [];
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async getAllForUserInDateRange(
        context: Context,
        userId: number,
        startDate: PureDate,
        endDate: PureDate
    ): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitDao.getForUserInDateRange(
            userId,
            startDate,
            endDate
        );
        if (!scheduledHabits) {
            return [];
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async getHabitSummaries(
        context: Context,
        cutoffDate: PureDate
    ): Promise<HabitSummary[]> {
        const scheduledHabits = await ScheduledHabitDao.getAll(context.userId);
        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        const habitSummaries = ScheduledHabitSummaryProvider.createSummaries(
            scheduledHabitModels,
            cutoffDate
        );

        habitSummaries.sort((a, b) => {
            const aSort = a.nextHabitDays ?? -1 * (a.lastHabitDays ?? 0);
            const bSort = b.nextHabitDays ?? -1 * (b.lastHabitDays ?? 0);
            return aSort > bSort ? 1 : -1;
        });

        return habitSummaries;
    }

    public static async getHabitSummary(
        context: Context,
        habitId: number,
        cutoffDate: PureDate
    ): Promise<HabitSummary> {
        const scheduledHabits = await ScheduledHabitDao.getAllByHabitIdAndUserId(
            habitId,
            context.userId
        );
        if (!scheduledHabits) {
            throw new ServiceException(
                404,
                Code.SCHEDULED_HABIT_NOT_FOUND,
                'scheduled habit not found'
            );
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        const habitSummaries = ScheduledHabitSummaryProvider.createSummaries(
            scheduledHabitModels,
            cutoffDate
        );

        if (habitSummaries.length !== 1) {
            throw new ServiceException(
                500,
                Code.SCHEDULED_HABIT_ERROR,
                'failed to create habit summary'
            );
        }

        return habitSummaries[0];
    }

    public static async archiveAll(context: Context, ids: number[]): Promise<void> {
        const promises = ids.map((id) => this.archive(context, id));
        await Promise.all(promises);
    }

    public static async archive(context: Context, id: number): Promise<void> {
        const date = new Date(context.dayKey);
        date.setDate(date.getDate() - 1);
        date.setHours(0, 0, 0, 0);

        await ScheduledHabitDao.archive(context.userId, id, date);
    }

    public static async count(context: Context): Promise<number> {
        return ScheduledHabitDao.count(context.userId);
    }

    public static async getAllByTaskId(
        context: Context,
        taskId: number
    ): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitDao.getAllByUserIdAndTaskId(
            context.userId,
            taskId
        );
        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async getLatestVersionByTaskId(
        context: Context,
        taskId: number
    ): Promise<ScheduledHabit> {
        const scheduledHabits = await ScheduledHabitDao.getAllByUserIdAndTaskId(
            context.userId,
            taskId
        );
        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);

        scheduledHabitModels.sort((a, b) => {
            return (a.id ?? 0) > (b.id ?? 0) ? -1 : 1;
        });

        if (scheduledHabitModels.length === 0) {
            throw new ServiceException(
                404,
                Code.SCHEDULED_HABIT_NOT_FOUND,
                'scheduled habit not found'
            );
        }

        return scheduledHabitModels[0];
    }
}
