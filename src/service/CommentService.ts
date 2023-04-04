import { CreateCommentRequest, CreateCommentResponse } from '@resources/types/GeneralTypes';
import { Response } from '@resources/types/RequestTypes';
import { CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID, GENERAL_FAILURE, INVALID_REQUEST, RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { CommentController, CommentableType } from '@src/controller/common/CommentController';
import { Request } from 'express';
import { NotificationService, NotificationType } from './NotificationService';
import { UserPostController } from '@src/controller/UserPostController';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';

export class CommentService {
    public static async create(type: CommentableType, request: Request): Promise<CreateCommentResponse> {
        const targetId = Number(request.params.id);
        const comment = (request.body as CreateCommentRequest).comment;

        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID;
        }

        const exists = await this.exists(type, targetId);
        if (!exists) {
            return { ...RESOURCE_NOT_FOUND, message: 'target does not exist' };
        }

        const result = await CommentController.create(type, userId, targetId, comment);
        if (!result) {
            return { ...GENERAL_FAILURE, message: 'unknown error' };
        }
        NotificationService.createNotification(
            type === CommentableType.PLANNED_DAY_RESULT ? result.plannedDayResults[0].plannedDay.userId : result.userPosts[0].userId,
            userId,
            type === CommentableType.PLANNED_DAY_RESULT ? NotificationType.PLANNED_DAY_RESULT_COMMENT : NotificationType.TIMELINE_COMMENT,
            targetId
        );
        return SUCCESS;
    }

    public static async delete(request: Request): Promise<Response> {
        const id = Number(request.params.id);
        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return { ...INVALID_REQUEST, message: 'invalid request' };
        }

        const comment = await CommentController.get(id);
        if (!comment || comment.userId !== userId) {
            return { ...RESOURCE_NOT_FOUND, message: 'comment does not exist' };
        }

        await CommentController.delete(id);
        return SUCCESS;
    }

    private static async exists(type: CommentableType, targetId: number): Promise<boolean> {
        let exists = false;
        switch (type) {
            case CommentableType.PLANNED_DAY_RESULT:
                exists = await PlannedDayResultController.existsById(targetId);
                break;

            case CommentableType.USER_POST:
                exists = await UserPostController.existsById(targetId);
                break;
        }

        return exists;
    }
}
