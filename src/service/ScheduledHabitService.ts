import { ScheduledHabit } from '@resources/schema';
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

    public static async getActive(userId: number): Promise<ScheduledHabit[]> {
        const scheduledHabits = await ScheduledHabitController.getActive(userId);
        if (!scheduledHabits) {
            return [];
        }

        const scheduledHabitModels: ScheduledHabit[] = ModelConverter.convertAll(scheduledHabits);
        return scheduledHabitModels;
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
}
