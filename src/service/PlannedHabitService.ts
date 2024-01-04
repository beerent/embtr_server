import { PlannedTask } from '@resources/schema';
import {
    CreateOrReplacePlannedTaskResponse,
    GetPlannedHabitResponse,
    UpdatePlannedTaskRequest,
    UpdatePlannedTaskResponse,
} from '@resources/types/requests/PlannedTaskTypes';
import {
    CREATE_PLANNED_TASK_FAILED,
    CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    GET_PLANNED_DAY_SUCCESS,
    SUCCESS,
    UPDATE_PLANNED_TASK_FAILED,
} from '@src/common/RequestResponses';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { ChallengeService } from './ChallengeService';
import { Request } from 'express';
import { Constants } from '@resources/types/constants/constants';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { PlannedDayDao } from '@src/database/PlannedDayDao';
import { PlannedHabitDao } from '@src/database/PlannedHabitDao';

export class PlannedHabitService {
    public static async getById(id: number): Promise<GetPlannedHabitResponse> {
        const plannedHabit = await PlannedHabitDao.get(id);
        if (!plannedHabit) {
            return GET_PLANNED_DAY_FAILED_NOT_FOUND;
        }

        const convertedPlannedHabit: PlannedTask = ModelConverter.convert(plannedHabit);
        return { ...GET_PLANNED_DAY_SUCCESS, plannedHabit: convertedPlannedHabit };
    }

    public static async createOrUpdate(
        dayKey: string,
        request: Request
    ): Promise<CreateOrReplacePlannedTaskResponse> {
        const plannedTask = request.body.plannedTask;
        if (plannedTask.id) {
            return this.update(request);
        }

        return this.create(dayKey, request);
    }

    public static async create(
        dayKey: string,
        request: Request
    ): Promise<CreateOrReplacePlannedTaskResponse> {
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const plannedTask = request.body.plannedTask;
        const plannedDay = await PlannedDayDao.getByUserAndDayKey(userId, dayKey);
        if (!plannedDay || plannedDay.userId !== userId) {
            return CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY;
        }
        plannedTask.plannedDayId = plannedDay.id;

        const createdPlannedTask = await PlannedHabitDao.create(plannedTask);
        if (!createdPlannedTask) {
            return CREATE_PLANNED_TASK_FAILED;
        }

        const plannedTaskModel: PlannedTask = ModelConverter.convert(createdPlannedTask);
        return { ...SUCCESS, plannedTask: plannedTaskModel };
    }

    public static async update(request: Request): Promise<UpdatePlannedTaskResponse> {
        const updateRequest: UpdatePlannedTaskRequest = request.body;

        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        const plannedTask = await PlannedHabitDao.get(updateRequest.plannedTask!.id!);
        if (!plannedTask) {
            return UPDATE_PLANNED_TASK_FAILED;
        }

        if (plannedTask.plannedDay.userId !== userId) {
            return UPDATE_PLANNED_TASK_FAILED;
        }

        updateRequest.plannedTask.status = this.getUpdatedStatus(updateRequest.plannedTask);

        const updatedPlannedTask = await PlannedHabitDao.update(updateRequest.plannedTask);
        if (!updatedPlannedTask) {
            return UPDATE_PLANNED_TASK_FAILED;
        }

        const updatedPlannedTaskModel: PlannedTask = ModelConverter.convert(plannedTask);
        const completedChallenges =
            await ChallengeService.updateChallengeRequirementProgress(updatedPlannedTaskModel);

        return { ...SUCCESS, plannedTask: updatedPlannedTaskModel, completedChallenges };
    }

    private static getUpdatedStatus(plannedTask: PlannedTask): string {
        if (
            (plannedTask.status ?? Constants.HabitStatus.INCOMPLETE) === 
            Constants.HabitStatus.INCOMPLETE
            &&
            (plannedTask.completedQuantity ?? 0) >= (plannedTask.quantity ?? 1)
        ) {
            return Constants.HabitStatus.COMPLETE;
        }

        return plannedTask.status ?? Constants.HabitStatus.INCOMPLETE;
    }
}
