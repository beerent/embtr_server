import { Notification as NotificationModel, PushNotificationToken } from '../../schema';
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

export interface GetPushNotificationTokenRequest {
    token: string;
}

export interface GetPushNotificationTokenResponse extends Response {
    pushNotificationToken: PushNotificationToken;
}
