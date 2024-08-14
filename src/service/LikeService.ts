import { HttpCode } from '@src/common/RequestResponses';
import { ChallengeDao } from '@src/database/ChallengeDao';
import { LikeDao } from '@src/database/LikeDao';
import { PlannedDayResultDao } from '@src/database/PlannedDayResultDao';
import { QuoteOfTheDayDao } from '@src/database/QuoteOfTheDayDao';
import { UserPostDao } from '@src/database/UserPostDao';
import { Context } from '@src/general/auth/Context';
import { Like } from '@resources/schema';
import { Code } from '@resources/codes';
import { ServiceException } from '@src/general/exception/ServiceException';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { LikeEventDispatcher } from '@src/event/like/LikeEventDispatcher';
import { Constants } from '@resources/types/constants/constants';
import { NotificationType } from './NotificationService';
import { FeaturedPostDao } from '@src/database/FeaturedPostDao';

export class LikeService {
    public static async create(
        context: Context,
        interactable: Constants.Interactable,
        targetId: number
    ): Promise<Like> {
        const exists = await this.exists(interactable, targetId);
        if (!exists) {
            throw new ServiceException(
                HttpCode.RESOURCE_NOT_FOUND,
                Code.RESOURCE_NOT_FOUND,
                'resource not found'
            );
        }

        const alreadyLiked = await LikeDao.exists(interactable, context.userId, targetId);
        if (alreadyLiked) {
            throw new ServiceException(
                HttpCode.RESOURCE_ALREADY_EXISTS,
                Code.RESOURCE_ALREADY_EXISTS,
                'already liked'
            );
        }

        const like = await LikeDao.create(interactable, context.userId, targetId);
        if (!like) {
            throw new ServiceException(
                HttpCode.GENERAL_FAILURE,
                Code.GENERIC_ERROR,
                'failed to save like'
            );
        }
        const likeModel: Like = ModelConverter.convert(like);

        const toUserId = this.getToUserId(interactable, likeModel);
        if (!toUserId) {
            return likeModel;
        }

        const notificationType = this.getNotificationType(interactable);
        LikeEventDispatcher.onCreated(
            context,
            notificationType,
            context.userId,
            toUserId,
            targetId
        );

        return likeModel;
    }

    private static async exists(
        interactable: Constants.Interactable,
        targetId: number
    ): Promise<boolean> {
        let exists = false;

        switch (interactable) {
            case Constants.Interactable.PLANNED_DAY_RESULT:
                exists = await PlannedDayResultDao.existsById(targetId);
                break;

            case Constants.Interactable.USER_POST:
                exists = await UserPostDao.existsById(targetId);
                break;

            case Constants.Interactable.QUOTE_OF_THE_DAY:
                exists = await QuoteOfTheDayDao.existsById(targetId);
                break;

            case Constants.Interactable.CHALLENGE:
                exists = await ChallengeDao.existsById(targetId);
                break;

            case Constants.Interactable.FEATURED_POST:
                exists = await FeaturedPostDao.existsById(targetId);
                break;
        }

        return exists;
    }

    private static getToUserId(
        interactable: Constants.Interactable,
        like: Like
    ): number | undefined {
        switch (interactable) {
            case Constants.Interactable.USER_POST:
                return like.userPosts?.[0].userId ?? 0;

            case Constants.Interactable.CHALLENGE:
                return like.challenges?.[0].creatorId ?? 0;

            case Constants.Interactable.PLANNED_DAY_RESULT:
                return like.plannedDayResults?.[0].plannedDay?.userId ?? 0;

            case Constants.Interactable.QUOTE_OF_THE_DAY:
                return like.quoteOfTheDays?.[0].userId ?? 0;

            case Constants.Interactable.FEATURED_POST:
            default:
                return undefined;
        }
    }

    private static getNotificationType(interactable: Constants.Interactable): NotificationType {
        if (interactable === Constants.Interactable.USER_POST) {
            return NotificationType.TIMELINE_LIKE;
        }

        if (interactable === Constants.Interactable.CHALLENGE) {
            return NotificationType.CHALLENGE_LIKE;
        }

        return NotificationType.PLANNED_DAY_RESULT_LIKE;
    }
}
