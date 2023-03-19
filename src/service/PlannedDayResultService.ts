import { PlannedDayResultModel } from '@resources/models/PlannedDayResultModel';
import {
    CreatePlannedDayResultRequest,
    GetPlannedDayResultRequest,
    GetPlannedDayResultResponse,
    GetPlannedDayResultsResponse,
    UpdatePlannedDayRequest,
    UpdatePlannedDayResponse,
} from '@resources/types/PlannedDayResultTypes';
import {
    CREATE_DAY_RESULT_FAILED,
    GET_DAY_RESULT_UNKNOWN,
    SUCCESS,
    UPDATE_PLANNED_DAY_RESULT_INVALID,
    UPDATE_PLANNED_DAY_RESULT_UNKNOWN,
} from '@src/common/RequestResponses';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { PlannedDayController } from '@src/controller/PlannedDayController';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';
import { Request } from 'express';
import { AuthorizationController } from '@src/controller/AuthorizationController';

export class PlannedDayResultService {
    public static async create(request: CreatePlannedDayResultRequest): Promise<GetPlannedDayResultResponse> {
        const plannedDay = await PlannedDayController.get(request.plannedDayId);
        if (!plannedDay) {
            return CREATE_DAY_RESULT_FAILED;
        }

        const createdDayResult = await PlannedDayResultController.create(request.plannedDayId);

        if (createdDayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convertPlannedDayResult(createdDayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async update(request: Request): Promise<UpdatePlannedDayResponse> {
        const updateRequest: UpdatePlannedDayRequest = request.body;

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
            const updatedPlannedDayResultModel = ModelConverter.convertPlannedDayResult(updatedPlannedDayResult);
            return { ...SUCCESS, plannedDayResult: updatedPlannedDayResultModel };
        }

        return UPDATE_PLANNED_DAY_RESULT_INVALID;
    }

    public static async getAll(): Promise<GetPlannedDayResultsResponse> {
        const dayResults = await PlannedDayResultController.getAll();

        if (dayResults) {
            const convertedDayResults: PlannedDayResultModel[] = ModelConverter.convertPlannedDayResults(dayResults);
            return { ...SUCCESS, dayResults: convertedDayResults };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getById(id: number): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultController.getById(id);

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convertPlannedDayResult(dayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getByUserAndDayKey(request: GetPlannedDayResultRequest): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultController.getByUserAndDayKey(request.userId, request.dayKey);

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convertPlannedDayResult(dayResult);
            return { ...SUCCESS, dayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }
}
