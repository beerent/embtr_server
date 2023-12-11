import { Notification } from '@prisma/client';
import { Notification as NotificationModel, NotificationTargetPage } from '@resources/schema';
import {
    ClearNotificationsRequest,
    GetNotificationsResponse,
    GetUnreadNotificationCountResponse,
} from '@resources/types/requests/NotificationTypes';
import { Response } from '@resources/types/requests/RequestTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationController } from '@src/controller/AuthorizationController';
import { NotificationController } from '@src/controller/NotificationController';
import { PushNotificationController } from '@src/controller/PushNotificationController';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';

export enum NotificationType {
    TIMELINE_COMMENT,
    TIMELINE_TAG,
    TIMELINE_LIKE,
    CHALLENGE_COMMENT,
    DAILY_RESULT_TAG,
    PLANNED_DAY_RESULT_COMMENT,
    PLANNED_DAY_RESULT_LIKE,
    FAILED_DAILY_RESULT_LIKE,
    NEW_FOLLOWER,
    QUOTE_LIKE,
    QUOTE_SELECTED,
    GOAL_COMMENT,
    GOAL_LIKE,
    CHALLENGE_LIKE,
}

export class NotificationService {
    public static async createNotification(
        toUserId: number,
        fromUserId: number,
        notificationType: NotificationType,
        targetId: number
    ) {
        // 1. store in database
        const notification = await NotificationController.create(
            toUserId,
            fromUserId,
            NotificationService.getSummary(notificationType),
            NotificationService.getTargetPage(notificationType),
            targetId
        );

        const notificationModel: NotificationModel = ModelConverter.convert(notification);

        // 2. send push notification
        PushNotificationController.send(notificationModel);

        return notification;
    }

    public static async getAll(request: Request): Promise<GetNotificationsResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        const notifications: Notification[] = await NotificationController.getAll(userId);
        const notificationModels: NotificationModel[] = ModelConverter.convertAll(notifications);

        return { ...SUCCESS, notifications: notificationModels };
    }

    public static async getUnreadNotificationCount(
        request: Request
    ): Promise<GetUnreadNotificationCountResponse> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request', count: 0 };
        }

        const count = await NotificationController.countAllUnread(userId);
        return { ...SUCCESS, count };
    }

    public static async clear(request: Request): Promise<Response> {
        const userId: number = (await AuthorizationController.getUserIdFromToken(
            request.headers.authorization!
        )) as number;
        if (!userId) {
            return { ...GENERAL_FAILURE, message: 'invalid request' };
        }

        await NotificationController.clearAll(userId);

        return SUCCESS;
    }

    private static getSummary(notificationType: NotificationType): string {
        switch (notificationType) {
            case NotificationType.TIMELINE_COMMENT:
                return 'commented on your post';
            case NotificationType.TIMELINE_LIKE:
                return 'liked your post';
            case NotificationType.PLANNED_DAY_RESULT_LIKE:
                return 'liked your completed day';
            case NotificationType.PLANNED_DAY_RESULT_COMMENT:
                return 'commented on your completed day';
            case NotificationType.NEW_FOLLOWER:
                return 'now follows you!';
            case NotificationType.QUOTE_LIKE:
                return 'liked your quote of the day!';
            case NotificationType.QUOTE_SELECTED:
                return "Your quote was selected for today's Quote Of The Day!";
            case NotificationType.GOAL_COMMENT:
                return 'commented on your goal';
            case NotificationType.GOAL_LIKE:
                return 'liked your goal';
            case NotificationType.CHALLENGE_LIKE:
                return 'liked your challenge';
            case NotificationType.CHALLENGE_COMMENT:
                return 'commented on your challenge';

            default:
                return 'tagged you in a comment';
        }
    }

    private static getTargetPage(notificationType: NotificationType): NotificationTargetPage {
        switch (notificationType) {
            case NotificationType.CHALLENGE_COMMENT:
                return NotificationTargetPage.CHALLENGE_DETAILS;
            case NotificationType.TIMELINE_COMMENT:
            case NotificationType.TIMELINE_TAG:
            case NotificationType.TIMELINE_LIKE:
                return NotificationTargetPage.USER_POST_DETAILS;
            case NotificationType.DAILY_RESULT_TAG:
            case NotificationType.PLANNED_DAY_RESULT_COMMENT:
            case NotificationType.PLANNED_DAY_RESULT_LIKE:
                return NotificationTargetPage.PLANNED_DAY_RESULT;
            case NotificationType.NEW_FOLLOWER:
                return NotificationTargetPage.USER_PROFILE;
            case NotificationType.QUOTE_LIKE:
            case NotificationType.QUOTE_SELECTED:
                return NotificationTargetPage.TODAY;
            case NotificationType.GOAL_COMMENT:
            case NotificationType.GOAL_LIKE:
                return NotificationTargetPage.GOAL_DETAILS;
            case NotificationType.CHALLENGE_LIKE:
            case NotificationType.CHALLENGE_COMMENT:
                return NotificationTargetPage.CHALLENGE_DETAILS;

            default:
                return NotificationTargetPage.INVALID;
        }
    }
}
