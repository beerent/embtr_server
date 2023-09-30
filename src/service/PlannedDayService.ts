import {
    PlannedTask as PlannedTaskModel,
    PlannedDay as PlannedDayModel,
    PlannedTask,
} from '@resources/schema';
import {
    CreatePlannedDayResponse,
    GetPlannedDayRequest,
    GetPlannedDayResponse,
} from '@resources/types/requests/PlannedDayTypes';
import {
    CreatePlannedTaskRequest,
    UpdatePlannedTaskRequest,
    UpdatePlannedTaskResponse,
} from '@resources/types/requests/PlannedTaskTypes';
import {
    CREATE_PLANNED_DAY_FAILED,
    CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS,
    CREATE_PLANNED_DAY_SUCCESS,
    CREATE_PLANNED_TASK_FAILED,
    CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY,
    CREATE_PLANNED_TASK_UNKNOWN_TASK,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    GET_PLANNED_DAY_SUCCESS,
    RESOURCE_NOT_FOUND,
    SUCCESS,
    UPDATE_PLANNED_TASK_FAILED,
} from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { TaskController } from '@src/controller/TaskController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';
import { UnitController } from '@src/controller/UnitController';
import { ChallengeService } from './ChallengeService';
import { ScheduledHabitController } from '@src/controller/ScheduledHabitController';

export class PlannedDayService {
    public static async getById(id: number): Promise<GetPlannedDayResponse> {
        const plannedDay = await PlannedDayController.get(id);

        if (plannedDay) {
            const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(plannedDay);
            return { ...GET_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
        }

        return GET_PLANNED_DAY_FAILED_NOT_FOUND;
    }

    public static async getByUser(request: GetPlannedDayRequest): Promise<GetPlannedDayResponse> {
        const plannedDay = await PlannedDayController.getOrCreateByUserAndDayKey(
            request.userId,
            request.dayKey
        );

        const dayOfWeek = plannedDay?.date.getUTCDay() + 1 ?? 0;
        const scheduledHabits = await ScheduledHabitController.getForUserAndDayOfWeek(
            request.userId,
            dayOfWeek
        );
        const plannedTaskScheduledHabitIds = plannedDay?.plannedTasks.map(
            (plannedTask) => plannedTask.scheduledHabitId
        );
        const scheduledHabitsWithoutPlannedTasks = scheduledHabits.filter((scheduledHabit) => {
            return !plannedTaskScheduledHabitIds?.includes(scheduledHabit.id);
        });

        const placeHolderPlannedTasks: PlannedTask[] = [];
        for (const scheduledHabit of scheduledHabitsWithoutPlannedTasks) {
            const placeHolderPlannedTask: PlannedTask = {
                plannedDayId: plannedDay?.id,
                scheduledHabitId: scheduledHabit.id,
                title: scheduledHabit.task.title,
                description: scheduledHabit.description ?? '',
                iconUrl: scheduledHabit.task.iconUrl ?? '',
                unitId: scheduledHabit.unitId ?? 0,
                quantity: scheduledHabit.quantity ?? 1,
                completedQuantity: 0,
                active: true,
            };

            placeHolderPlannedTasks.push(placeHolderPlannedTask);
        }

        if (!plannedDay) {
            return GET_PLANNED_DAY_FAILED_NOT_FOUND;
        }

        const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(plannedDay);
        convertedPlannedDay.plannedTasks = [
            ...(convertedPlannedDay.plannedTasks ?? []),
            ...placeHolderPlannedTasks,
        ];

        return { ...GET_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
    }

    public static async create(request: Request): Promise<CreatePlannedDayResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        const dayKey = request.body.dayKey;

        const preExistingDayKey = await PlannedDayController.getByUserAndDayKey(userId, dayKey);
        if (preExistingDayKey) {
            return CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS;
        }

        const createdPlannedDay = await PlannedDayController.create(userId, dayKey);
        if (createdPlannedDay) {
            const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(createdPlannedDay);
            return { ...CREATE_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
        }

        return CREATE_PLANNED_DAY_FAILED;
    }

    public static async createPlannedTask(
        dayKey: string,
        request: Request
    ): Promise<UpdatePlannedTaskResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const plannedTask = request.body.plannedTask;
        const plannedDay = await PlannedDayController.getByUserAndDayKey(userId, dayKey);
        if (!plannedDay || plannedDay.userId !== userId) {
            return CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY;
        }
        plannedTask.plannedDayId = plannedDay.id;

        const createdPlannedTask = await PlannedTaskController.create(plannedTask);

        if (createdPlannedTask) {
            const plannedTaskModel: PlannedTask = ModelConverter.convert(createdPlannedTask);
            return { ...SUCCESS, plannedTask: plannedTaskModel };
        }

        return CREATE_PLANNED_TASK_FAILED;
    }

    public static async update(request: Request): Promise<UpdatePlannedTaskResponse> {
        const updateRequest: UpdatePlannedTaskRequest = request.body;

        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const plannedTask = await PlannedTaskController.get(updateRequest.plannedTask!.id!);
        if (!plannedTask) {
            return UPDATE_PLANNED_TASK_FAILED;
        }

        if (plannedTask.plannedDay.userId !== userId) {
            return UPDATE_PLANNED_TASK_FAILED;
        }

        const updatedPlannedTask = await PlannedTaskController.update(updateRequest.plannedTask);
        if (updatedPlannedTask) {
            const updatedPlannedTaskModel: PlannedTaskModel =
                ModelConverter.convert(updatedPlannedTask);
            const completedChallenges = await ChallengeService.updateChallengeRequirementProgress(
                updatedPlannedTaskModel
            );

            return { ...SUCCESS, plannedTask: updatedPlannedTaskModel, completedChallenges };
        }

        return UPDATE_PLANNED_TASK_FAILED;
    }
}
