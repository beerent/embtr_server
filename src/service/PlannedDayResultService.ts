import { Comment as CommentModel, Like as LikeModel, PlannedDayResult as PlannedDayResultModel } from '@resources/schema';
import {
    CreatePlannedDayResultCommentRequest,
    CreatePlannedDayResultCommentResponse,
    CreatePlannedDayResultRequest,
    GetPlannedDayResultRequest,
    GetPlannedDayResultResponse,
    GetPlannedDayResultsResponse,
    UpdatePlannedDayResultRequest,
    UpdatePlannedDayResultResponse,
} from '@resources/types/PlannedDayResultTypes';
import {
    CREATE_DAY_RESULT_FAILED,
    CREATE_PLANNED_DAY_RESULT_COMMENT_FAILED,
    CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID,
    CREATE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN,
    CREATE_PLANNED_DAY_RESULT_LIKE_FAILED,
    DELETE_PLANNED_DAY_RESULT_COMMENT_INVALID,
    DELETE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN,
    GENERAL_FAILURE,
    GET_DAY_RESULT_UNKNOWN,
    RESOURCE_ALREADY_EXISTS,
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
import { Response } from '@resources/types/RequestTypes';
import { NotificationService, NotificationType } from './NotificationService';

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

    public static async createLike(request: Request): Promise<Response> {
        const plannedDayResultId = Number(request.params.id);

        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const plannedDayResult = await PlannedDayResultController.getById(plannedDayResultId);
        if (!plannedDayResult) {
            return { ...RESOURCE_NOT_FOUND, message: 'planned day result not found' };
        }

        const userAlreadyLiked = plannedDayResult.likes?.some((like) => like.userId === userId);
        if (userAlreadyLiked) {
            return { ...RESOURCE_ALREADY_EXISTS, message: 'user already liked planned day result' };
        }

        const plannedDayResultModel: PlannedDayResultModel = ModelConverter.convert(plannedDayResult);
        const likeModel: LikeModel = { userId };
        plannedDayResultModel.likes = plannedDayResultModel.likes ? [...plannedDayResultModel.likes, likeModel] : [likeModel];
        const result = await PlannedDayResultController.update(plannedDayResultModel);
        if (result) {
            await NotificationService.createNotification(
                plannedDayResult.plannedDay.userId,
                userId,
                NotificationType.PLANNED_DAY_RESULT_LIKE,
                plannedDayResult.id
            );
            return SUCCESS;
        }

        return CREATE_PLANNED_DAY_RESULT_LIKE_FAILED;
    }

    public static async createComment(request: Request): Promise<CreatePlannedDayResultCommentResponse> {
        const plannedDayResultId = Number(request.params.id);
        const comment = (request.body as CreatePlannedDayResultCommentRequest).comment;

        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID;
        }

        const plannedDayResult = await PlannedDayResultController.getById(plannedDayResultId);
        if (!plannedDayResult?.id) {
            return CREATE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN;
        }

        const plannedDayResultModel: PlannedDayResultModel = ModelConverter.convert(plannedDayResult);
        const commentModel: CommentModel = { comment, userId };
        plannedDayResultModel.comments = plannedDayResultModel.comments ? [...plannedDayResultModel.comments, commentModel] : [commentModel];

        const result = await PlannedDayResultController.update(plannedDayResultModel);
        if (result) {
            NotificationService.createNotification(
                plannedDayResult.plannedDay.userId,
                userId,
                NotificationType.PLANNED_DAY_RESULT_COMMENT,
                plannedDayResult.id
            );
            return SUCCESS;
        }

        return CREATE_PLANNED_DAY_RESULT_COMMENT_FAILED;
    }

    public static async deleteComment(request: Request): Promise<Response> {
        const id = Number(request.params.id);
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return DELETE_PLANNED_DAY_RESULT_COMMENT_INVALID;
        }

        const comment = await PlannedDayResultController.getComment(id);
        if (!comment || comment.userId !== userId) {
            return DELETE_PLANNED_DAY_RESULT_COMMENT_UNKNOWN;
        }

        await PlannedDayResultController.deleteComment(id);
        return SUCCESS;
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
