import {
    HttpCode,
} from '@src/common/RequestResponses';
import { NotificationService, NotificationType } from './NotificationService';
import { Interactable } from '@resources/types/interactable/Interactable';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Comment } from '@resources/schema';
import { ChallengeDao } from '@src/database/ChallengeDao';
import { CreateCommentResult, CommentDao } from '@src/database/CommentDao';
import { PlannedDayResultDao } from '@src/database/PlannedDayResultDao';
import { UserPostDao } from '@src/database/UserPostDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';

export class CommentService {
    public static async create(
        context: Context,
        interactable: Interactable,
        targetId: number,
        comment: string
    ): Promise<Comment> {
        const exists = await this.exists(interactable, targetId);
        if (!exists) {
            throw new ServiceException(HttpCode.RESOURCE_NOT_FOUND, Code.RESOURCE_NOT_FOUND, 'resource not found');
        }

        const result: CreateCommentResult = await CommentDao.create(
            interactable,
            context.userId,
            targetId,
            comment
        );

        if (!result) {
            throw new ServiceException(HttpCode.GENERAL_FAILURE, Code.GENERIC_ERROR, 'failed to save comment');
        }

        const commentModel: Comment = ModelConverter.convert(result);

        // todo run this as a background job
        await NotificationService.createNotification(
            context,
            interactable === Interactable.PLANNED_DAY_RESULT
                ? result.plannedDayResults[0].plannedDay.userId
                : interactable === Interactable.USER_POST
                    ? result.userPosts[0].userId
                    : result.challenges[0].creatorId,
            context.userId,
            interactable === Interactable.PLANNED_DAY_RESULT
                ? NotificationType.PLANNED_DAY_RESULT_COMMENT
                : interactable === Interactable.USER_POST
                    ? NotificationType.TIMELINE_COMMENT
                    : NotificationType.CHALLENGE_COMMENT,
            targetId
        );

        return commentModel;
    }

    public static async delete(context: Context, id: number): Promise<void> {
        const comment = await CommentDao.get(id);
        if (!comment) {
            throw new ServiceException(HttpCode.RESOURCE_NOT_FOUND, Code.RESOURCE_NOT_FOUND, 'comment not found');
        }

        if (comment.userId !== context.userId) {
            throw new ServiceException(HttpCode.UNAUTHORIZED, Code.UNAUTHORIZED, 'unauthorized');
        }

        await CommentDao.delete(id);
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
