import { PlannedDayResult as PlannedDayResultModel } from '@resources/schema';
import {
    CreatePlannedDayResultRequest,
    GetPlannedDayResultRequest,
    GetPlannedDayResultResponse,
    GetPlannedDayResultsResponse,
    UpdatePlannedDayResultRequest,
    UpdatePlannedDayResultResponse,
} from '@resources/types/requests/PlannedDayResultTypes';
import {
    CREATE_DAY_RESULT_FAILED,
    GET_DAY_RESULT_UNKNOWN,
    SUCCESS,
    UPDATE_PLANNED_DAY_RESULT_INVALID,
    UPDATE_PLANNED_DAY_RESULT_UNKNOWN,
} from '@src/common/RequestResponses';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';
import { Request } from 'express';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { PlannedDayResult } from '@prisma/client';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';

export class PlannedDayResultService {
    public static async create(request: CreatePlannedDayResultRequest): Promise<GetPlannedDayResultResponse> {
        const plannedDay = await PlannedDayController.get(request.plannedDayId);
        if (!plannedDay) {
            return CREATE_DAY_RESULT_FAILED;
        }

        const createdPlannedDayResult: PlannedDayResult = await PlannedDayResultController.create(request.plannedDayId);

        if (createdPlannedDayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convert(createdPlannedDayResult);
            return { ...SUCCESS, plannedDayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async update(request: Request): Promise<UpdatePlannedDayResultResponse> {
        const updateRequest: UpdatePlannedDayResultRequest = request.body;

        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return UPDATE_PLANNED_DAY_RESULT_INVALID;
        }

        const plannedDayResult = await PlannedDayResultController.getById(updateRequest.plannedDayResult!.id!);
        if (!plannedDayResult) {
            return UPDATE_PLANNED_DAY_RESULT_UNKNOWN;
        }

        if (plannedDayResult.plannedDay.user.id !== userId) {
            return UPDATE_PLANNED_DAY_RESULT_UNKNOWN;
        }

        const updatedPlannedDayResult = await PlannedDayResultController.update(updateRequest.plannedDayResult!);
        if (updatedPlannedDayResult) {
            const updatedPlannedDayResultModel: PlannedDayResultModel = ModelConverter.convert(updatedPlannedDayResult);
            return { ...SUCCESS, plannedDayResult: updatedPlannedDayResultModel };
        }

        return UPDATE_PLANNED_DAY_RESULT_INVALID;
    }

    public static async getAll(): Promise<GetPlannedDayResultsResponse> {
        const dayResults = await PlannedDayResultController.getAll();

        if (dayResults) {
            const convertedDayResults: PlannedDayResultModel[] = ModelConverter.convertAll(dayResults);
            return { ...SUCCESS, plannedDayResults: convertedDayResults };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getById(id: number): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultController.getById(id);

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convert(dayResult);
            return { ...SUCCESS, plannedDayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getByUserAndDayKey(request: GetPlannedDayResultRequest): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultController.getByUserAndDayKey(request.userId, request.dayKey);

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convert(dayResult);
            return { ...SUCCESS, plannedDayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }
}
