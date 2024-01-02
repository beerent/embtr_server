import { ScheduledHabit, Task } from '@resources/schema';
import { Response } from '@resources/types/requests/RequestTypes';
import {
    CreateScheduledHabitResponse,
    GetScheduledHabitResponse,
} from '@resources/types/requests/ScheduledHabitTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { ScheduledHabitController } from '@src/controller/ScheduledHabitController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';
import { Context } from '@src/general/auth/Context';
import { HabitSummary } from '@resources/types/habit/Habit';
import { GetHabitSummariesResponse } from '@resources/types/requests/HabitTypes';
import { PureDate } from '@resources/types/date/PureDate';

export class ScheduledHabitService {
    public static async createOrUpdate(request: Request): Promise<CreateScheduledHabitResponse> {
        const requestScheduledHabit: ScheduledHabit = request.body.scheduledHabit;
        if (requestScheduledHabit.id) {
            return this.update(request);
        }

        return this.create(request);
    }

    public static async create(request: Request): Promise<CreateScheduledHabitResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const requestScheduledHabit: ScheduledHabit = request.body.scheduledHabit;
        const scheduledHabit = await ScheduledHabitController.create(
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
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const requestScheduledHabit: ScheduledHabit = request.body.scheduledHabit;
        if (!requestScheduledHabit.id) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const existingScheduledHabit = await ScheduledHabitController.get(requestScheduledHabit.id);
        if (!existingScheduledHabit) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const scheduledHabit = await ScheduledHabitController.update(
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

    public static async get(id: number): Promise<GetScheduledHabitResponse> {
        const scheduledHabit = await ScheduledHabitController.get(id);
        if (!scheduledHabit) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const scheduledHabitModel: ScheduledHabit = ModelConverter.convert(scheduledHabit);
        return { ...SUCCESS, scheduledHabit: scheduledHabitModel };
    }

    public static async getRecent(userId: number): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitController.getRecent(userId);
        if (!scheduledHabits) {
            return [];
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async getActive(userId: number, date: PureDate): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitController.getActive(userId, date);
        if (!scheduledHabits) {
            return [];
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
    }

    public static async getSummaries(
        context: Context,
        cutoffDate: PureDate
    ): Promise<GetHabitSummariesResponse> {
        // 1. get all the scheduled habits
        const scheduledHabits = await ScheduledHabitController.getAll(context.userId);
        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);

        // 2. group by task
        const taskToScheduledHabitMap = this.buildTaskToScheduledHabitMap(scheduledHabitModels);
        const habitSummaries = this.buildHabitSummaries(taskToScheduledHabitMap, cutoffDate);

        return { ...SUCCESS, habitSummaries: habitSummaries };
    }

    public static async getHabitSummary(context: Context, habitId: number) {
        // get all scheduled habits
        // what does a scheduled habit summary
        /*
        {
            * task
            * list of active scheduled habits
            * list of inactive scheduled habits
            * history
        }
         */
    }

    public static async archive(request: Request): Promise<Response> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const id: number = Number(request.params.id);

        const now = new Date();
        await ScheduledHabitController.archive(userId, id, now);

        return { ...SUCCESS };
    }

    private static buildHabitSummaries(
        taskToScheduledHabitMap: Map<Task, ScheduledHabit[]>,
        cutoffDate: PureDate
    ) {
        const habitSummaries: HabitSummary[] = [];
        for (const task of taskToScheduledHabitMap.keys()) {
            const scheduledHabits = taskToScheduledHabitMap.get(task)!;

            const nextScheduledHabitDate = this.getNextScheduledHabitDate(
                scheduledHabits,
                cutoffDate
            );

            let daysApart: number | undefined = undefined;
            if (nextScheduledHabitDate) {
                daysApart = cutoffDate.daysApart(nextScheduledHabitDate);
            }

            const activeScheduledCount = scheduledHabits.filter(
                (scheduledHabit) => scheduledHabit.startDate ?? new Date() > new Date() // needs to get PureDate from user
            ).length;

            const habitSummary: HabitSummary = {
                task: task,
                nextActiveDays: daysApart,
                activeScheduledCount: activeScheduledCount,
                currentStreak: 0,
            };
            habitSummaries.push(habitSummary);
        }
        return habitSummaries;
    }

    private static buildTaskToScheduledHabitMap(scheduledHabitModels: ScheduledHabit[]) {
        const taskToScheduledHabitMap: Map<Task, ScheduledHabit[]> = new Map();
        for (const scheduledHabitModel of scheduledHabitModels) {
            if (!scheduledHabitModel.task) {
                continue;
            }

            let found = false;
            for (const key of taskToScheduledHabitMap.keys()) {
                if (key.id === scheduledHabitModel.task.id) {
                    taskToScheduledHabitMap.get(key)?.push(scheduledHabitModel);
                    found = true;
                    break;
                }
            }
            if (found) {
                continue;
            }

            taskToScheduledHabitMap.set(scheduledHabitModel.task, [scheduledHabitModel]);
        }
        return taskToScheduledHabitMap;
    }

    private static getNextScheduledHabitDate(
        scheduledHabits: ScheduledHabit[],
        cutoffDate: PureDate
    ): PureDate | undefined {
        let foundNextScheduledHabit: ScheduledHabit | undefined;

        for (const currentScheduledHabit of scheduledHabits) {
            const startDate = currentScheduledHabit.startDate;
            if (!startDate) {
                continue;
            }

            const currentStartDate = PureDate.fromDate(startDate);

            if (currentStartDate < cutoffDate) {
                continue;
            }

            if (!foundNextScheduledHabit || !foundNextScheduledHabit.startDate) {
                foundNextScheduledHabit = currentScheduledHabit;
                continue;
            }

            const foundNextStartDate = PureDate.fromDate(foundNextScheduledHabit.startDate);

            if (currentStartDate < foundNextStartDate) {
                foundNextScheduledHabit = currentScheduledHabit;
            }
        }

        return foundNextScheduledHabit
            ? PureDate.fromDate(foundNextScheduledHabit.startDate!)
            : undefined;
    }
}
