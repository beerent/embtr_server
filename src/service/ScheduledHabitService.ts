import { ScheduledHabit, Task } from '@resources/schema';
import { Response } from '@resources/types/requests/RequestTypes';
import {
    CreateScheduledHabitResponse,
    GetScheduledHabitResponse,
    GetScheduledHabitsResponse,
} from '@resources/types/requests/ScheduledHabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';
import { Context } from '@src/general/auth/Context';
import { HabitSummary } from '@resources/types/habit/Habit';
import { PureDate } from '@resources/types/date/PureDate';
import { ScheduledHabitSummaryProvider } from '@src/provider/ScheduledHabitSummaryProvider';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { ScheduledHabitDao } from '@src/database/ScheduledHabitDao';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';

export class ScheduledHabitService {
    public static async createOrUpdate(
        context: Context,
        scheduledHabit: ScheduledHabit
    ): Promise<ScheduledHabit> {
        if (scheduledHabit.id) {
            return this.update(context, scheduledHabit);
        }

        return this.create(context, scheduledHabit);
    }

    public static async create(
        context: Context,
        scheduledHabit: ScheduledHabit
    ): Promise<ScheduledHabit> {
        const createdScheduledHabit = await ScheduledHabitDao.create(
            context.userId,
            scheduledHabit.taskId!,
            scheduledHabit.description,
            scheduledHabit.quantity,
            scheduledHabit.unitId,
            scheduledHabit.daysOfWeek
                ?.map((day) => day.id)
                .filter((id) => id !== undefined) as number[],
            scheduledHabit.timesOfDay
                ?.map((time) => time.id)
                .filter((id) => id !== undefined) as number[],
            scheduledHabit.startDate,
            scheduledHabit.endDate
        );

        const createdScheduledHabitModel: ScheduledHabit =
            ModelConverter.convert(createdScheduledHabit);
        return createdScheduledHabitModel;
    }

    public static async update(
        context: Context,
        scheduledHabit: ScheduledHabit
    ): Promise<ScheduledHabit> {
        if (!scheduledHabit.id || !scheduledHabit.taskId) {
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

        const updatedScheduledHabit = await ScheduledHabitDao.update(
            scheduledHabit.id,
            context.userId,
            scheduledHabit.taskId,
            scheduledHabit.description,
            scheduledHabit.quantity,
            scheduledHabit.unitId,
            scheduledHabit.daysOfWeek
                ?.map((day) => day.id)
                .filter((id) => id !== undefined) as number[],
            scheduledHabit.timesOfDay
                ?.map((time) => time.id)
                .filter((id) => id !== undefined) as number[],
            scheduledHabit.startDate,
            scheduledHabit.endDate
        );

        const updatedScheduledHabitModel: ScheduledHabit =
            ModelConverter.convert(updatedScheduledHabit);
        return updatedScheduledHabitModel;
    }

    public static async replace(
        context: Context,
        scheduledHabit: ScheduledHabit
    ): Promise<ScheduledHabit> {
        const updatedScheduledHabit = this.update(context, scheduledHabit);
        return updatedScheduledHabit;
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

    public static async getActive(userId: number, date: PureDate): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitDao.getActive(userId, date);
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

    public static async archive(context: Context, id: number): Promise<void> {
        const now = new Date();
        await ScheduledHabitDao.archive(context.userId, id, now);
    }
}
