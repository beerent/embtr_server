import {
    CreateCommentRequest,
    CreateCommentResponse,
} from '@resources/types/requests/GeneralTypes';
import { Response } from '@resources/types/requests/RequestTypes';
import {
    CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID,
    GENERAL_FAILURE,
    INVALID_REQUEST,
    RESOURCE_NOT_FOUND,
    SUCCESS,
} from '@src/common/RequestResponses';
import { Request } from 'express';
import { NotificationService, NotificationType } from './NotificationService';
import { Interactable } from '@resources/types/interactable/Interactable';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Comment } from '@resources/schema';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { ChallengeDao } from '@src/database/ChallengeDao';
import { CreateCommentResult, CommentDao } from '@src/database/CommentDao';
import { PlannedDayResultDao } from '@src/database/PlannedDayResultDao';
import { UserPostDao } from '@src/database/UserPostDao';

export class CommentService {
    public static async create(
        interactable: Interactable,
        request: Request
    ): Promise<CreateCommentResponse> {
        const targetId = Number(request.params.id);
        const comment = (request.body as CreateCommentRequest).comment;

        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return CREATE_PLANNED_DAY_RESULT_COMMENT_INVALID;
        }

        const exists = await this.exists(interactable, targetId);
        if (!exists) {
            return { ...RESOURCE_NOT_FOUND, message: 'target does not exist' };
        }

        const result: CreateCommentResult = await CommentDao.create(
            interactable,
            userId,
            targetId,
            comment
        );

        if (!result) {
            return { ...GENERAL_FAILURE, message: 'unknown error' };
        }

        const commentModel: Comment = ModelConverter.convert(result);

        const notification = await NotificationService.createNotification(
            interactable === Interactable.PLANNED_DAY_RESULT
                ? result.plannedDayResults[0].plannedDay.userId
                : interactable === Interactable.USER_POST
                  ? result.userPosts[0].userId
                  : result.challenges[0].creatorId,
            userId,
            interactable === Interactable.PLANNED_DAY_RESULT
                ? NotificationType.PLANNED_DAY_RESULT_COMMENT
                : interactable === Interactable.USER_POST
                  ? NotificationType.TIMELINE_COMMENT
                  : NotificationType.CHALLENGE_COMMENT,
            targetId
        );
        return { ...SUCCESS, comment: commentModel };
    }

    public static async delete(request: Request): Promise<Response> {
        const id = Number(request.params.id);
        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...INVALID_REQUEST, message: 'invalid request' };
        }

        const comment = await CommentDao.get(id);
        if (!comment || comment.userId !== userId) {
            return { ...RESOURCE_NOT_FOUND, message: 'comment does not exist' };
        }

        await CommentDao.delete(id);
        return SUCCESS;
    }

    private static async exists(interactable: Interactable, targetId: number): Promise<boolean> {
        let exists = false;
        switch (interactable) {
            case Interactable.PLANNED_DAY_RESULT:
                exists = await PlannedDayResultDao.existsById(targetId);
                break;

            case Interactable.USER_POST:
                exists = await UserPostDao.existsById(targetId);
                break;

            case Interactable.CHALLENGE:
                exists = await ChallengeDao.existsById(targetId);
                break;
        }

        return exists;
    }
}
