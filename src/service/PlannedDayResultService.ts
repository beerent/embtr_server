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
    RESOURCE_NOT_FOUND,
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
import { UserController } from '@src/controller/UserController';
import { Response } from '@resources/types/requests/RequestTypes';
import { HiddenPlannedDayResultRecommendationsController } from '@src/controller/HiddenPlannedDayResultRecommendationsController';

export class PlannedDayResultService {
    public static async create(request: Request): Promise<GetPlannedDayResultResponse> {
        const body: CreatePlannedDayResultRequest = {
            plannedDayId: request.body.plannedDayId,
        };

        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;

        if (!userId) {
            return CREATE_DAY_RESULT_FAILED;
        }

        const plannedDay = await PlannedDayController.get(body.plannedDayId);
        if (!plannedDay) {
            return CREATE_DAY_RESULT_FAILED;
        }

        if (plannedDay.user.id !== userId) {
            return CREATE_DAY_RESULT_FAILED;
        }

        const createdPlannedDayResult: PlannedDayResult = await PlannedDayResultController.create(
            body.plannedDayId
        );

        if (createdPlannedDayResult) {
            const convertedDayResult: PlannedDayResultModel =
                ModelConverter.convert(createdPlannedDayResult);
            return { ...SUCCESS, plannedDayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async update(request: Request): Promise<UpdatePlannedDayResultResponse> {
        const updateRequest: UpdatePlannedDayResultRequest = request.body;

        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return UPDATE_PLANNED_DAY_RESULT_INVALID;
        }

        const plannedDayResult = await PlannedDayResultController.getById(
            updateRequest.plannedDayResult!.id!
        );
        if (!plannedDayResult) {
            return UPDATE_PLANNED_DAY_RESULT_UNKNOWN;
        }

        if (plannedDayResult.plannedDay.user.id !== userId) {
            return UPDATE_PLANNED_DAY_RESULT_UNKNOWN;
        }

        const updatedPlannedDayResult = await PlannedDayResultController.update(
            updateRequest.plannedDayResult!
        );
        if (updatedPlannedDayResult) {
            const updatedPlannedDayResultModel: PlannedDayResultModel =
                ModelConverter.convert(updatedPlannedDayResult);
            return { ...SUCCESS, plannedDayResult: updatedPlannedDayResultModel };
        }

        return UPDATE_PLANNED_DAY_RESULT_INVALID;
    }

    public static async getAllForUser(userId: number): Promise<GetPlannedDayResultsResponse> {
        const user = await UserController.getById(userId);
        if (!user) {
            return { ...RESOURCE_NOT_FOUND, message: 'user not found' };
        }

        const dayResults = await PlannedDayResultController.getAllForUser(userId);

        if (dayResults) {
            const convertedDayResults: PlannedDayResultModel[] =
                ModelConverter.convertAll(dayResults);
            return { ...SUCCESS, plannedDayResults: convertedDayResults };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async getAll(request: Request): Promise<GetPlannedDayResultsResponse> {
        let upperBound = new Date();
        if (request.query.upperBound) {
            upperBound = new Date(request.query.upperBound as string);
        }

        let lowerBound = new Date(new Date().setMonth(new Date().getMonth() - 3));
        if (request.query.lowerBound) {
            lowerBound = new Date(request.query.lowerBound as string);
        }

        const dayResults = await PlannedDayResultController.getAll(upperBound, lowerBound);

        if (dayResults) {
            const convertedDayResults: PlannedDayResultModel[] =
                ModelConverter.convertAll(dayResults);
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

    public static async getByUserAndDayKey(
        request: GetPlannedDayResultRequest
    ): Promise<GetPlannedDayResultResponse> {
        const dayResult = await PlannedDayResultController.getByUserAndDayKey(
            request.userId,
            request.dayKey
        );

        if (dayResult) {
            const convertedDayResult: PlannedDayResultModel = ModelConverter.convert(dayResult);
            return { ...SUCCESS, plannedDayResult: convertedDayResult };
        }

        return GET_DAY_RESULT_UNKNOWN;
    }

    public static async hideRecommendation(request: Request): Promise<Response> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...UPDATE_PLANNED_DAY_RESULT_INVALID, message: 'invalid user' };
        }

        const dayKey = request.params.dayKey;
        const plannedDay = await PlannedDayController.getByUserAndDayKey(userId, dayKey);
        if (!plannedDay) {
            return { ...UPDATE_PLANNED_DAY_RESULT_INVALID, message: 'invalid day' };
        }

        await HiddenPlannedDayResultRecommendationsController.create(userId, dayKey);
        return SUCCESS;
    }
}
