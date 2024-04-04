import { NotificationService, NotificationType } from './NotificationService';
import {
    HttpCode,
} from '@src/common/RequestResponses';
import { Interactable } from '@resources/types/interactable/Interactable';
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

export class LikeService {
    public static async create(context: Context, interactable: Interactable, targetId: number): Promise<Like> {
        const exists = await this.exists(interactable, targetId);
        if (!exists) {
            throw new ServiceException(HttpCode.RESOURCE_NOT_FOUND, Code.RESOURCE_NOT_FOUND, 'resource not found');
        }

        const alreadyLiked = await LikeDao.exists(interactable, context.userId, targetId);
        if (alreadyLiked) {
            throw new ServiceException(HttpCode.RESOURCE_ALREADY_EXISTS, Code.RESOURCE_ALREADY_EXISTS, 'already liked');
        }

        const like = await LikeDao.create(interactable, context.userId, targetId);
        if (!like) {
            throw new ServiceException(HttpCode.GENERAL_FAILURE, Code.GENERIC_ERROR, 'failed to save like');
        }
        const likeModel: Like = ModelConverter.convert(like);

        const toUserId =
            interactable === Interactable.USER_POST
                ? like.userPosts[0].userId
                : interactable === Interactable.PLANNED_DAY_RESULT
                    ? like.plannedDayResults[0].plannedDay.userId
                    : interactable === Interactable.QUOTE_OF_THE_DAY
                        ? like.quoteOfTheDays[0].userId
                        : like.challenges[0].creatorId;

        const notificationType =
            interactable === Interactable.PLANNED_DAY_RESULT
                ? NotificationType.PLANNED_DAY_RESULT_LIKE
                : interactable === Interactable.USER_POST
                    ? NotificationType.TIMELINE_LIKE
                    : interactable === Interactable.QUOTE_OF_THE_DAY
                        ? NotificationType.QUOTE_LIKE
                        : NotificationType.CHALLENGE_LIKE;
        await NotificationService.createNotification(context, toUserId, context.userId, notificationType, targetId);

        return likeModel;
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

            case Interactable.QUOTE_OF_THE_DAY:
                exists = await QuoteOfTheDayDao.existsById(targetId);
                break;

            case Interactable.CHALLENGE:
                exists = await ChallengeDao.existsById(targetId);
                break;
        }

        return exists;
    }
}
