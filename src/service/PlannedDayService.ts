import { PlannedTask as PlannedTaskModel, PlannedDay as PlannedDayModel } from '@resources/schema';
import { CreatePlannedDayResponse, GetPlannedDayRequest, GetPlannedDayResponse } from '@resources/types/PlannedDayTypes';
import { CreatePlannedTaskRequest, UpdatePlannedTaskRequest, UpdatePlannedTaskResponse } from '@resources/types/PlannedTaskTypes';
import {
    CREATE_PLANNED_DAY_FAILED,
    CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS,
    CREATE_PLANNED_DAY_SUCCESS,
    CREATE_PLANNED_TASK_FAILED,
    CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY,
    CREATE_PLANNED_TASK_UNKNOWN_TASK,
    GET_PLANNED_DAY_FAILED_NOT_FOUND,
    GET_PLANNED_DAY_SUCCESS,
    SUCCESS,
    UPDATE_PLANNED_TASK_FAILED,
} from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedTaskController } from '@src/controller/PlannedTaskController';
import { TaskController } from '@src/controller/TaskController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

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
        const plannedDay = await PlannedDayController.getByUserAndDayKey(request.userId, request.dayKey);

        if (plannedDay) {
            const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(plannedDay);
            return { ...GET_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
        }

        return GET_PLANNED_DAY_FAILED_NOT_FOUND;
    }

    public static async create(request: Request): Promise<CreatePlannedDayResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        const dayKey = request.body.dayKey;

        const date = new Date(dayKey);

        const preExistingDayKey = await PlannedDayController.getByUserAndDayKey(userId, dayKey);
        if (preExistingDayKey) {
            return CREATE_PLANNED_DAY_FAILED_ALREADY_EXISTS;
        }

        const createdPlannedDay = await PlannedDayController.create(userId, date, dayKey);
        if (createdPlannedDay) {
            const convertedPlannedDay: PlannedDayModel = ModelConverter.convert(createdPlannedDay);
            return { ...CREATE_PLANNED_DAY_SUCCESS, plannedDay: convertedPlannedDay };
        }

        return CREATE_PLANNED_DAY_FAILED;
    }

    public static async createPlannedTask(request: Request): Promise<CreatePlannedDayResponse> {
        const body: CreatePlannedTaskRequest = request.body;
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;

        //todo add test for userId comparison
        const plannedDay = await PlannedDayController.get(body.plannedDayId);
        if (!plannedDay || plannedDay.userId !== userId) {
            return CREATE_PLANNED_TASK_UNKNOWN_PLANNED_DAY;
        }

        const task = await TaskController.get(body.taskId);
        if (!task) {
            return CREATE_PLANNED_TASK_UNKNOWN_TASK;
        }

        const createdPlannedTask = await PlannedTaskController.create(plannedDay, task);
        if (createdPlannedTask) {
            return SUCCESS;
        }

        return CREATE_PLANNED_TASK_FAILED;
    }

    public static async update(request: Request): Promise<UpdatePlannedTaskResponse> {
        const updateRequest: UpdatePlannedTaskRequest = request.body;

        //todo validate user id
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;

        const plannedTask = await PlannedTaskController.get(updateRequest.plannedTask!.id!);
        if (!plannedTask) {
            return UPDATE_PLANNED_TASK_FAILED;
        }

        const updatedPlannedTask = await PlannedTaskController.update(updateRequest.plannedTask);
        if (updatedPlannedTask) {
            const updatedPlannedTaskModel: PlannedTaskModel = ModelConverter.convert(updatedPlannedTask);
            return { ...SUCCESS, plannedTask: updatedPlannedTaskModel };
        }

        return UPDATE_PLANNED_TASK_FAILED;
    }
}
