import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import {
    Notification,
    PushNotificationReceipt,
    PushNotificationToken,
    User,
} from '@resources/schema';
import { Context } from '@src/general/auth/Context';
import { UserPropertyService } from './UserPropertyService';
import { Constants } from '@resources/types/constants/constants';
import { logger } from '@src/common/logger/Logger';
import { PushNotificationReceiptService } from './PushNotificationReceiptService';
import { PushNotificationTokenService } from './PushNotificationTokenService';

interface EmbtrExpoPushMessage extends ExpoPushMessage {
    pushNotificationTokenId: number;
    userId: number;
}

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
        await this.sendPushNotification(context, pushNotification);
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
        await this.sendPushNotification(context, pushNotification);
    }

    public static async sendPushNotifications(
        context: Context,
        pushNotifications: PushNotification[]
    ) {
        const pushMessages = this.createExpoPushMessages(pushNotifications);
        await this.sendExpoPushMessages(context, pushMessages);
    }

    private static async sendPushNotification(
        context: Context,
        pushNotification: PushNotification
    ) {
        const pushMessages = await this.createExpoPushMessage(pushNotification);
        await this.sendExpoPushMessages(context, pushMessages);
    }

    private static async createExpoPushMessage(pushNotification: PushNotification) {
        return this.createExpoPushMessages([pushNotification]);
    }

    private static createExpoPushMessages(pushNotifications: PushNotification[]) {
        const messages: EmbtrExpoPushMessage[] = [];

        for (const pushNotification of pushNotifications) {
            const userPushNotificationTokens: PushNotificationToken[] =
                pushNotification.toUser?.pushNotificationTokens || [];

            for (const userPushNotificationToken of userPushNotificationTokens) {
                if (!Expo.isExpoPushToken(userPushNotificationToken.token)) {
                    console.error(
                        `Push token ${userPushNotificationToken} is not a valid Expo push token`
                    );
                    continue;
                }

                messages.push({
                    pushNotificationTokenId: userPushNotificationToken.id ?? 0,
                    userId: pushNotification.toUser.id ?? 0,
                    to: userPushNotificationToken.token,
                    sound: 'default',
                    body: pushNotification.message,
                    data: { withSome: 'data' },
                });
            }
        }

        return messages;
    }

    private static async sendExpoPushMessages(
        context: Context,
        embtrPushMessages: EmbtrExpoPushMessage[]
    ) {
        let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

        const receiptsToCreate: PushNotificationReceipt[] = [];

        let chunks = expo.chunkPushNotifications(embtrPushMessages);
        for (let chunk of chunks) {
            try {
                let ticketChunk: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
                for (let i = 0; i < ticketChunk.length; i++) {
                    const embtrPushMessage = embtrPushMessages[i];
                    const ticket = ticketChunk[i];

                    //console.log('embtrPushMessage:', embtrPushMessage);

                    const expoTicketId =
                        ticket.status === 'ok' && ticket.id ? ticket.id : undefined;
                    const expoErrorMessage = ticket.status === 'error' ? ticket.message : undefined;
                    const expoErrorDetail =
                        ticket.status === 'error' ? ticket.details?.error : undefined;

                    receiptsToCreate.push({
                        userId: embtrPushMessage.userId,
                        pushNotificationTokenId: embtrPushMessage.pushNotificationTokenId,
                        message: embtrPushMessage.body,
                        expoStatus: ticket.status.toUpperCase(),
                        expoTicketId,
                        expoErrorMessage,
                        expoErrorDetail,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        console.log('creating receipts:', receiptsToCreate.length);
        await PushNotificationReceiptService.createAll(context, receiptsToCreate);
    }

    public static async processPending(context: Context) {
        const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

        const pendingPushNotifications =
            await PushNotificationReceiptService.getAllPending(context);
        const receiptIds = pendingPushNotifications.map((receipt) => receipt.expoTicketId ?? '');

        const updatedReceipts: PushNotificationReceipt[] = [];

        let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        for (const chunk of receiptIdChunks) {
            try {
                const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

                for (const receiptId of chunk) {
                    const receipt = receipts[receiptId];
                    if (!receipt) {
                        continue;
                    }

                    if (receipt.status === 'ok') {
                        updatedReceipts.push({
                            expoTicketId: receiptId,
                            expoStatus: 'OK',
                            status: Constants.PushNotificationStatus.SENT,
                        });
                    } else {
                        updatedReceipts.push({
                            expoTicketId: receiptId,
                            expoErrorMessage: receipt.message,
                            expoErrorDetail: receipt.details?.error,
                            expoStatus: 'ERROR',
                            status: Constants.PushNotificationStatus.FAILED,
                        });
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }

        await PushNotificationReceiptService.UpdateAllByTicketId(context, updatedReceipts);
    }

    public static async processFailed(context: Context) {
        const pushNotificationTokenIdsToInvalidate = new Set<number>();
        const updatedReceipts: PushNotificationReceipt[] = [];

        const failedPushNotifications = await PushNotificationReceiptService.getAllFailed(context);
        for (const failedPushNotification of failedPushNotifications) {
            const invalidCredentials = ['DeviceNotRegistered', 'InvalidCredentials'].includes(
                failedPushNotification.expoErrorDetail ?? ''
            );

            if (invalidCredentials) {
                pushNotificationTokenIdsToInvalidate.add(
                    failedPushNotification.pushNotificationTokenId ?? 0
                );
                updatedReceipts.push({
                    id: failedPushNotification.id,
                    status: Constants.PushNotificationStatus.FAILED_INVALIDATED,
                });
            } else {
                updatedReceipts.push({
                    id: failedPushNotification.id,
                    status: Constants.PushNotificationStatus.FAILED_ACKNOWLEDGED,
                });
            }
        }

        await Promise.all([
            PushNotificationTokenService.invalidateAll(
                context,
                Array.from(pushNotificationTokenIdsToInvalidate)
            ),
            PushNotificationReceiptService.UpdateStatuses(context, updatedReceipts),
        ]);
    }

    public static async socialNotificationsEnabled(
        context: Context,
        userId: number
    ): Promise<boolean> {
        const property = await UserPropertyService.getSocialNotification(context, userId);
        return property === Constants.SocialNotificationSetting.ENABLED;
    }
}
