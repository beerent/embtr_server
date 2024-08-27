export interface PushNotificationStats {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    failedAcknowledged: number;
    failedInvalidated: number;
}
