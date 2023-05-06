import { Response } from '@resources/types/requests/RequestTypes';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { Request } from 'express';
import { NotificationService, NotificationType } from './NotificationService';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';
import {
    CREATE_PLANNED_DAY_RESULT_LIKE_FAILED,
    GENERAL_FAILURE,
    RESOURCE_ALREADY_EXISTS,
    RESOURCE_NOT_FOUND,
    SUCCESS,
} from '@src/common/RequestResponses';
import { LikeController } from '@src/controller/common/LikeController';
import { UserPostController } from '@src/controller/UserPostController';
import { Interactable } from '@resources/types/interactable/Interactable';

export class LikeService {
    public static async create(interactable: Interactable, request: Request): Promise<Response> {
        const targetId = Number(request.params.id);

        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const exists = await this.exists(interactable, targetId);
        if (!exists) {
            return { ...RESOURCE_NOT_FOUND, message: 'not found' };
        }

        const alreadyLiked = await LikeController.exists(interactable, userId, targetId);
        if (alreadyLiked) {
            return { ...RESOURCE_ALREADY_EXISTS, message: 'already liked' };
        }

        const result = await LikeController.create(interactable, userId, targetId);
        if (!result) {
            return CREATE_PLANNED_DAY_RESULT_LIKE_FAILED;
        }

        await NotificationService.createNotification(
            interactable === Interactable.PLANNED_DAY_RESULT
                ? result.plannedDayResults[0].plannedDay.userId
                : result.userPosts[0].userId,
            userId,
            interactable === Interactable.PLANNED_DAY_RESULT
                ? NotificationType.PLANNED_DAY_RESULT_LIKE
                : NotificationType.TIMELINE_LIKE,
            targetId
        );
        return SUCCESS;
    }

    private static async exists(interactable: Interactable, targetId: number): Promise<boolean> {
        let exists = false;
        switch (interactable) {
            case Interactable.PLANNED_DAY_RESULT:
                exists = await PlannedDayResultController.existsById(targetId);
                break;

            case Interactable.USER_POST:
                exists = await UserPostController.existsById(targetId);
                break;
        }

        return exists;
    }
}
