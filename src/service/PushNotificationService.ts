import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Notification, PushNotificationToken, User } from '@resources/schema';
import { Context } from '@src/general/auth/Context';
import { UserPropertyService } from './UserPropertyService';
import { Constants } from '@resources/types/constants/constants';
import { logger } from '@src/common/logger/Logger';
import { ApiAlertsService } from './ApiAlertsService';

export interface PushNotification {
    context: Context;
    toUser: User;
    message: string;
    fromUser?: User;
}

export class PushNotificationService {
    public static createPushNotification(
        context: Context,
        toUser: User,
        message: string,
        fromUser?: User
    ) {
        const pushNotification: PushNotification = {
            context,
            toUser,
            message,
            fromUser,
        };

        return pushNotification;
    }

    public static async sendGenericNotification(context: Context, toUser: User, message: string) {
        const pushNotification = this.createPushNotification(context, toUser, message);
        await this.sendPushNotification(pushNotification);
    }

    public static async sendSocialNotification(context: Context, notification: Notification) {
        if (!notification.toUserId) {
            return;
        }

        const socialNotificationsEnabled = await this.socialNotificationsEnabled(
            context,
            notification.toUserId
        );
        if (!socialNotificationsEnabled) {
            logger.info('skipping social notification, setting is disabled');
            return;
        }

        const fromUser = notification.fromUser;
        const toUser = notification.toUser;
        const summary = notification.summary;

        if (!fromUser || !toUser || !summary) {
            return;
        }

        const body = fromUser?.displayName + ' ' + summary;

        const pushNotification = this.createPushNotification(context, toUser, body, fromUser);
        await this.sendPushNotification(pushNotification);
    }

    public static async sendPushNotifications(
        context: Context,
        pushNotifications: PushNotification[]
    ) {
        const pushMessages = this.createExpoPushMessages(pushNotifications);
        await this.sendExpoPushMessages(pushMessages);
    }

    private static async sendPushNotification(pushNotification: PushNotification) {
        const pushMessages = await this.createExpoPushMessage(pushNotification);
        await this.sendExpoPushMessages(pushMessages);
    }

    private static async createExpoPushMessage(pushNotification: PushNotification) {
        return this.createExpoPushMessages([pushNotification]);
    }

    private static createExpoPushMessages(pushNotifications: PushNotification[]) {
        const messages: ExpoPushMessage[] = [];

        for (const pushNotification of pushNotifications) {
            const recieverTokens: PushNotificationToken[] =
                pushNotification.toUser?.pushNotificationTokens || [];

            // Create the messages that you want to send to clients
            for (let pushToken of recieverTokens) {
                // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

                // Check that all your push tokens appear to be valid Expo push tokens
                if (!Expo.isExpoPushToken(pushToken.token)) {
                    console.error(`Push token ${pushToken} is not a valid Expo push token`);
                    continue;
                }

                messages.push({
                    to: pushToken.token,
                    sound: 'default',
                    body: pushNotification.message,
                    data: { withSome: 'data' },
                });
            }
        }

        return messages;
    }

    private static async sendExpoPushMessages(pushMessages: ExpoPushMessage[]) {
        // Create a new Expo SDK client
        // optionally providing an access token if you have enabled push security
        let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
        let chunks = expo.chunkPushNotifications(pushMessages);
        let tickets: ExpoPushTicket[] = [];
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
            try {
                let ticketChunk: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
                console.error(error);
            }
        }

        // Later, after the Expo push notification service has delivered the
        // notifications to Apple or Google (usually quickly, but allow the the service
        // up to 30 minutes when under load), a "receipt" for each notification is
        // created. The receipts will be available for at least a day; stale receipts
        // are deleted.
        //
        // The ID of each receipt is sent back in the response "ticket" for each
        // notification. In summary, sending a notification produces a ticket, which
        // contains a receipt ID you later use to get the receipt.
        //
        // The receipts may contain error codes to which you must respond. In
        // particular, Apple or Google may block apps that continue to send
        // notifications to devices that have blocked notifications or have uninstalled
        // your app. Expo does not control this policy and sends back the feedback from
        // Apple and Google so you can handle it appropriately.
        let receiptIds: string[] = [];
        for (let i = 0; i < tickets.length; i++) {
            const ticket: ExpoPushTicket = tickets[i];
            if (ticket.status === 'ok' && ticket.id) {
                receiptIds.push(ticket.id);
            }
        }

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        // to retrieve batches of receipts from the Expo service.
        for (let chunk of receiptIdChunks) {
            try {
                let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                // The receipts specify whether Apple or Google successfully received the
                // notification and information about an error, if one occurred.
                let oneDelivered = false;
                for (let receiptId in receipts) {
                    let { status, details } = receipts[receiptId];
                    if (status === 'ok') {
                        oneDelivered = true;
                        continue;
                    } else if (status === 'error') {
                        console.error(status);
                        console.error(details);
                    }
                }

                if (oneDelivered) {
                } else {
                    ApiAlertsService.sendAlert('Failed to send push notification');
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    public static async socialNotificationsEnabled(
        context: Context,
        userId: number
    ): Promise<boolean> {
        const property = await UserPropertyService.getSocialNotification(context, userId);
        return property === Constants.SocialNotificationSetting.ENABLED;
    }
}
