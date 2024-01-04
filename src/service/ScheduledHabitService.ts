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
import {
    GetHabitSummariesResponse,
    GetHabitSummaryResponse,
} from '@resources/types/requests/HabitTypes';
import { PureDate } from '@resources/types/date/PureDate';
import { ScheduledHabitSummaryProvider } from '@src/provider/ScheduledHabitSummaryProvider';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { ScheduledHabitDao } from '@src/database/ScheduledHabitDao';

export class ScheduledHabitService {
    public static async createOrUpdate(request: Request): Promise<CreateScheduledHabitResponse> {
        const requestScheduledHabit: ScheduledHabit = request.body.scheduledHabit;
        if (requestScheduledHabit.id) {
            return this.update(request);
        }

        return this.create(request);
    }

    public static async create(request: Request): Promise<CreateScheduledHabitResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const requestScheduledHabit: ScheduledHabit = request.body.scheduledHabit;
        const scheduledHabit = await ScheduledHabitDao.create(
            userId,
            requestScheduledHabit.taskId!,
            requestScheduledHabit.description,
            requestScheduledHabit.quantity,
            requestScheduledHabit.unitId,
            requestScheduledHabit.daysOfWeek
                ?.map((day) => day.id)
                .filter((id) => id !== undefined) as number[],
            requestScheduledHabit.timesOfDay
                ?.map((time) => time.id)
                .filter((id) => id !== undefined) as number[],
            requestScheduledHabit.startDate,
            requestScheduledHabit.endDate
        );

        const scheduledHabitModel: ScheduledHabit = ModelConverter.convert(scheduledHabit);
        return { ...SUCCESS, scheduledHabit: scheduledHabitModel };
    }

    public static async update(request: Request): Promise<CreateScheduledHabitResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const requestScheduledHabit: ScheduledHabit = request.body.scheduledHabit;
        if (!requestScheduledHabit.id) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const existingScheduledHabit = await ScheduledHabitDao.get(requestScheduledHabit.id);
        if (!existingScheduledHabit) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const scheduledHabit = await ScheduledHabitDao.update(
            requestScheduledHabit.id,
            userId,
            existingScheduledHabit.taskId,
            requestScheduledHabit.description,
            requestScheduledHabit.quantity,
            requestScheduledHabit.unitId,
            requestScheduledHabit.daysOfWeek
                ?.map((day) => day.id)
                .filter((id) => id !== undefined) as number[],
            requestScheduledHabit.timesOfDay
                ?.map((time) => time.id)
                .filter((id) => id !== undefined) as number[],
            requestScheduledHabit.startDate,
            requestScheduledHabit.endDate
        );

        const scheduledHabitModel: ScheduledHabit = ModelConverter.convert(scheduledHabit);
        return { ...SUCCESS, scheduledHabit: scheduledHabitModel };
    }

    public static async replace(request: Request): Promise<CreateScheduledHabitResponse> {
        return this.update(request);
    }

    public static async getAllByHabit(
        context: Context,
        habitId: number
    ): Promise<GetScheduledHabitsResponse> {
        const scheduledHabits = await ScheduledHabitDao.getAllByHabitIdAndUserId(
            habitId,
            context.userId
        );
        if (!scheduledHabits) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return { ...SUCCESS, scheduledHabits: scheduledHabitModels };
    }

    public static async get(id: number): Promise<GetScheduledHabitResponse> {
        const scheduledHabit = await ScheduledHabitDao.get(id);
        if (!scheduledHabit) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const scheduledHabitModel: ScheduledHabit = ModelConverter.convert(scheduledHabit);
        return { ...SUCCESS, scheduledHabit: scheduledHabitModel };
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
    ): Promise<GetHabitSummariesResponse> {
        const scheduledHabits = await ScheduledHabitDao.getAll(context.userId);
        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        const habitSummaries = ScheduledHabitSummaryProvider.createSummaries(
            scheduledHabitModels,
            cutoffDate
        );

        return { ...SUCCESS, habitSummaries: habitSummaries };
    }

    public static async getHabitSummary(
        context: Context,
        habitId: number,
        cutoffDate: PureDate
    ): Promise<GetHabitSummaryResponse> {
        const scheduledHabits = await ScheduledHabitDao.getAllByHabitIdAndUserId(
            habitId,
            context.userId
        );
        if (!scheduledHabits) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        const habitSummaries = ScheduledHabitSummaryProvider.createSummaries(
            scheduledHabitModels,
            cutoffDate
        );

        if (habitSummaries.length !== 1) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        return { ...SUCCESS, habitSummary: habitSummaries[0] };
    }

    public static async archive(request: Request): Promise<Response> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const id: number = Number(request.params.id);

        const now = new Date();
        await ScheduledHabitDao.archive(userId, id, now);

        return { ...SUCCESS };
    }
}
