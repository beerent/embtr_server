import { HttpCode } from '@src/common/RequestResponses';
import { NotificationType } from './NotificationService';
import { Interactable } from '@resources/types/interactable/Interactable';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Comment } from '@resources/schema';
import { ChallengeDao } from '@src/database/ChallengeDao';
import { CommentDao } from '@src/database/CommentDao';
import { PlannedDayResultDao } from '@src/database/PlannedDayResultDao';
import { UserPostDao } from '@src/database/UserPostDao';
import { Context } from '@src/general/auth/Context';
import { ServiceException } from '@src/general/exception/ServiceException';
import { Code } from '@resources/codes';
import { CommentEventDispatcher } from '@src/event/comment/CommentEventDispatcher';

export class CommentService {
    public static async create(
        context: Context,
        interactable: Interactable,
        targetId: number,
        comment: string
    ): Promise<Comment> {
        const exists = await this.exists(interactable, targetId);
        if (!exists) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.RESOURCE_NOT_FOUND,
                'resource not found'
            );
        }

        const result = await CommentDao.create(interactable, context.userId, targetId, comment);

        if (!result) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'failed to save comment'
            );
        }

        const commentModel: Comment = ModelConverter.convert(result);

        this.dispatchCommentCreated(context, interactable, targetId, commentModel);

        return commentModel;
    }

    public static async delete(context: Context, id: number): Promise<void> {
        const comment = await CommentDao.get(id);
        if (!comment) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.RESOURCE_NOT_FOUND,
                'comment not found'
            );
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

    private static dispatchCommentCreated(
        context: Context,
        interactable: Interactable,
        targetId: number,
        commentModel: Comment
    ) {
        const fromUserId = context.userId;
        const ownerNotificationType = this.getNotificationType(interactable, {
            forOwner: true
        });
        const forOwnerUserId = this.getToUserId(interactable, commentModel);
        const toOtherUserIds = this.getOtherUserIds(interactable, commentModel).filter((id, index, arr) => {
            return id !== forOwnerUserId && id !== commentModel.userId && arr.indexOf(id) === index;
        });

        CommentEventDispatcher.onCreated(context, ownerNotificationType, fromUserId, forOwnerUserId, targetId);

        toOtherUserIds.forEach((toUserId) => {
            const notificationType = this.getNotificationType(interactable, {
                forOwner: false
            });
            CommentEventDispatcher.onCreated(context, notificationType, fromUserId, toUserId, targetId);
        })
    }

    private static getToUserId(interactable: Interactable, comment: Comment): number {
        if (interactable === Interactable.USER_POST) {
            return comment.userPosts?.[0].userId ?? 0;
        }

        if (interactable === Interactable.CHALLENGE) {
            return comment.challenges?.[0].creatorId ?? 0;
        }

        if (interactable === Interactable.PLANNED_DAY_RESULT) {
            return comment.plannedDayResults?.[0].plannedDay?.userId ?? 0;
        }

        return 0;
    }

    private static getOtherUserIds(interactable: Interactable, comment: Comment): number[] {
        if (interactable === Interactable.USER_POST) {
            return comment.userPosts?.[0]?.comments?.map(comment => comment.userId!) || []
        }

        if (interactable === Interactable.CHALLENGE) {
            return comment.challenges?.[0].comments?.map(comment => comment.userId!) || []
        }

        if (interactable === Interactable.PLANNED_DAY_RESULT) {
            return comment.plannedDayResults?.[0].comments?.map(comment => comment.userId!) || []
        }


        return [0];
    }

    private static getNotificationType(interactable: Interactable, { forOwner }: { forOwner: boolean }): NotificationType {
        if (interactable === Interactable.USER_POST) {
            return forOwner ? NotificationType.TIMELINE_COMMENT : NotificationType.TIMELINE_COMMENT_BACK;
        }

        if (interactable === Interactable.CHALLENGE) {
            return forOwner ? NotificationType.CHALLENGE_COMMENT : NotificationType.CHALLENGE_COMMENT_BACK;
        }

        return forOwner ? NotificationType.PLANNED_DAY_RESULT_COMMENT : NotificationType.PLANNED_DAY_RESULT_COMMENT_BACK;
    }
}
