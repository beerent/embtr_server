import { Response } from '@resources/types/RequestTypes';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { Request } from 'express';
import { NotificationService, NotificationType } from './NotificationService';
import { PlannedDayResultController } from '@src/controller/PlannedDayResultController';
import { CREATE_PLANNED_DAY_RESULT_LIKE_FAILED, GENERAL_FAILURE, RESOURCE_ALREADY_EXISTS, RESOURCE_NOT_FOUND, SUCCESS } from '@src/common/RequestResponses';
import { LikableType, LikeController } from '@src/controller/common/LikeController';
import { UserPostController } from '@src/controller/UserPostController';

export class LikeService {
    public static async create(type: LikableType, request: Request): Promise<Response> {
        const targetId = Number(request.params.id);

        const userId: number = (await AuthorizationController.getUserIdFromToken(request.headers.authorization!)) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const exists = await this.exists(type, targetId);
        if (!exists) {
            return { ...RESOURCE_NOT_FOUND, message: 'not found' };
        }

        const alreadyLiked = await LikeController.exists(type, userId, targetId);
        if (alreadyLiked) {
            return { ...RESOURCE_ALREADY_EXISTS, message: 'already liked' };
        }

        const result = await LikeController.create(type, userId, targetId);
        if (!result) {
            return CREATE_PLANNED_DAY_RESULT_LIKE_FAILED;
        }

        await NotificationService.createNotification(
            type === LikableType.PLANNED_DAY_RESULT ? result.plannedDayResults[0].plannedDay.userId : result.userPosts[0].userId,
            userId,
            type === LikableType.PLANNED_DAY_RESULT ? NotificationType.PLANNED_DAY_RESULT_COMMENT : NotificationType.TIMELINE_COMMENT,
            targetId
        );
        return SUCCESS;
    }

    private static async exists(type: LikableType, targetId: number): Promise<boolean> {
        let exists = false;
        switch (type) {
            case LikableType.PLANNED_DAY_RESULT:
                exists = await PlannedDayResultController.existsById(targetId);
                break;

            case LikableType.USER_POST:
                exists = await UserPostController.existsById(targetId);
                break;
        }

        return exists;
    }
}
