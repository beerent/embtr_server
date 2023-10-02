import { ScheduledHabit } from '@resources/schema';
import {
    CreateScheduledHabitRequest,
    CreateScheduledHabitResponse,
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

        const requestBody: CreateScheduledHabitRequest = request.body;
        const scheduledHabit = await ScheduledHabitController.create(
            userId,
            requestBody.taskId,
            requestBody.description,
            requestBody.quantity,
            requestBody.unitId,
            requestBody.daysOfWeekIds,
            requestBody.timesOfDayIds,
            requestBody.startDate,
            requestBody.endDate
        );

        const scheduledHabitModel: ScheduledHabit = ModelConverter.convert(scheduledHabit);
        return { ...SUCCESS, scheduledHabit: scheduledHabitModel };
    }
}
