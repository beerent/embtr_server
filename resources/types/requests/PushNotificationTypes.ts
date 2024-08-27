import { PushNotificationStats } from '../dto/PushNotification';
import { Response } from './RequestTypes';

export interface GetPushNotificationStatsResponse extends Response {
    stats: PushNotificationStats;
}
