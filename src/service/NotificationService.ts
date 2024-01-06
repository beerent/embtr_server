import { Notification, NotificationTargetPage } from '@resources/schema';
import {
    GetNotificationsResponse,
    GetUnreadNotificationCountResponse,
} from '@resources/types/requests/NotificationTypes';
import { Response } from '@resources/types/requests/RequestTypes';
import { GENERAL_FAILURE, SUCCESS } from '@src/common/RequestResponses';
import { AuthorizationDao } from '@src/database/AuthorizationDao';
import { NotificationDao } from '@src/database/NotificationDao';
import { PushNotificationDao } from '@src/database/PushNotificationDao';
import { Context } from '@src/general/auth/Context';
import { ModelConverter } from '@src/utility/model_conversion/ModelConverter';
import { Request } from 'express';
import { nativeEnum } from 'zod';

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
        const notification = await NotificationDao.create(
            toUserId,
            fromUserId,
            NotificationService.getSummary(notificationType),
            NotificationService.getTargetPage(notificationType),
            targetId
        );

        const notificationModel: Notification = ModelConverter.convert(notification);

        // 2. send push notification
        PushNotificationDao.send(notificationModel);

        return notification;
    }

    public static async getAll(context: Context): Promise<Notification[]> {
        const notifications = await NotificationDao.getAll(context.userId);
        const notificationModels: Notification[] = ModelConverter.convertAll(notifications);

        return notificationModels;
    }

    public static async getUnreadNotificationCount(context: Context): Promise<number> {
        const count = await NotificationDao.countAllUnread(context.userId);
        return count;
    }

    public static async clear(context: Context): Promise<void> {
        await NotificationDao.clearAll(context.userId);
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
