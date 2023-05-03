import { CreateTaskResponse } from '@resources/types/requests/TaskTypes';
import { SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { TaskHabitPreferenceController } from '@src/controller/TaskHabitPreferenceController';
import { Request } from 'express';

export class TaskHabitPreferenceService {
    public static async update(request: Request): Promise<CreateTaskResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const habitId = request.body.habitId;
        const taskId = Number(request.params.id);

        await TaskHabitPreferenceController.update(userId, taskId, habitId);
        return SUCCESS;
    }
}
