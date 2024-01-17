import { Notification as NotificationModel } from '../../schema';
import { Response } from './RequestTypes';

export interface GetUnreadNotificationCountResponse extends Response {
    count: number;
}

export interface GetNotificationsResponse extends Response {
    notifications?: NotificationModel[];
}

export interface ClearNotificationsRequest {
    notificationIds?: number[];
}

export interface CreatePushNotificationTokenRequest {
    token: string;
}
