import { Response } from '@resources/types/requests/RequestTypes';
import { Request } from 'express';
import { NotificationService, NotificationType } from './NotificationService';
import {
    CREATE_PLANNED_DAY_RESULT_LIKE_FAILED,
    GENERAL_FAILURE,
    RESOURCE_ALREADY_EXISTS,
    RESOURCE_NOT_FOUND,
    SUCCESS,
} from '@src/common/RequestResponses';
import { Interactable } from '@resources/types/interactable/Interactable';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { ChallengeDao } from '@src/database/ChallengeDao';
import { LikeDao } from '@src/database/LikeDao';
import { PlannedDayResultDao } from '@src/database/PlannedDayResultDao';
import { QuoteOfTheDayDao } from '@src/database/QuoteOfTheDayDao';
import { UserPostDao } from '@src/database/UserPostDao';

export class LikeService {
    public static async create(interactable: Interactable, request: Request): Promise<Response> {
        const targetId = Number(request.params.id);

        const userId: number = (await AuthorizationDao.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const exists = await this.exists(interactable, targetId);
        if (!exists) {
            return { ...RESOURCE_NOT_FOUND, message: 'not found' };
        }

        const alreadyLiked = await LikeDao.exists(interactable, userId, targetId);
        if (alreadyLiked) {
            return { ...RESOURCE_ALREADY_EXISTS, message: 'already liked' };
        }

        const result = await LikeDao.create(interactable, userId, targetId);
        if (!result) {
            return CREATE_PLANNED_DAY_RESULT_LIKE_FAILED;
        }

        const toUserId =
            interactable === Interactable.USER_POST
                ? result.userPosts[0].userId
                : interactable === Interactable.PLANNED_DAY_RESULT
                ? result.plannedDayResults[0].plannedDay.userId
                : interactable === Interactable.QUOTE_OF_THE_DAY
                ? result.quoteOfTheDays[0].userId
                : result.challenges[0].creatorId;

        const notificationType =
            interactable === Interactable.PLANNED_DAY_RESULT
                ? NotificationType.PLANNED_DAY_RESULT_LIKE
                : interactable === Interactable.USER_POST
                ? NotificationType.TIMELINE_LIKE
                : interactable === Interactable.QUOTE_OF_THE_DAY
                ? NotificationType.QUOTE_LIKE
                : NotificationType.CHALLENGE_LIKE;
        await NotificationService.createNotification(toUserId, userId, notificationType, targetId);
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
