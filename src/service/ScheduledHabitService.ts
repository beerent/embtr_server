import { ScheduledHabit } from '@resources/schema';
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

    public static async get(id: number): Promise<GetScheduledHabitResponse> {
        const scheduledHabit = await ScheduledHabitController.get(id);
        if (!scheduledHabit) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const scheduledHabitModel: ScheduledHabit = ModelConverter.convert(scheduledHabit);
        return { ...SUCCESS, scheduledHabit: scheduledHabitModel };
    }
}
