import { CreateTaskResponse, TaskPreferenceRequest } from '@resources/types/requests/TaskTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { TaskHabitPreferenceController } from '@src/controller/TaskPreferenceController';
import { Request } from 'express';

export class TaskHabitPreferenceService {
    public static async update(request: Request): Promise<CreateTaskResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const preferenceRequest: TaskPreferenceRequest = request.body;

        const habitId = preferenceRequest.habitId;
        const unitId = preferenceRequest.unitId;
        const quantity = preferenceRequest.quantity;
        const taskId = Number(request.params.id);

        await TaskHabitPreferenceController.update(userId, taskId, habitId, unitId, quantity);
        return SUCCESS;
    }
}
