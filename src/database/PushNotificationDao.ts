import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Notification as NotificationModel, PushNotificationToken } from '@resources/schema';
import { prisma } from '@database/prisma';

export class PushNotificationDao {
    public static async getByUid(uid: string) {
        const tokens = await prisma.pushNotificationToken.findMany({
            where: {
                user: {
                    uid,
                },
            },
            include: {
                user: true,
            },
        });

        return tokens;
    }

    public static async send(notification: NotificationModel) {
        // Create a new Expo SDK client
        // optionally providing an access token if you have enabled push security
        let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

        const fromUser = notification.fromUser;
        const recieverTokens: PushNotificationToken[] = notification.toUser?.pushNotificationTokens || [];

        // Create the messages that you want to send to clients
        let messages: ExpoPushMessage[] = [];
        for (let pushToken of recieverTokens) {
            // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(pushToken.token)) {
                console.error(`Push token ${pushToken} is not a valid Expo push token`);
                continue;
            }

            // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
            messages.push({
                to: pushToken.token,
                sound: 'default',
                body: fromUser?.displayName + ' ' + notification.summary,
                data: { withSome: 'data' },
            });
        }

        // The Expo push notification service accepts batches of notifications so
        // that you don't need to send 1000 requests to send 1000 notifications. We
        // recommend you batch your notifications to reduce the number of requests
        // and to compress them (notifications with similar content will get
        // compressed).
        let chunks = expo.chunkPushNotifications(messages);
        let tickets: ExpoPushTicket[] = [];
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
            try {
                let ticketChunk: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
                console.log(ticketChunk);
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
                console.log('receipts');
                console.log(receipts);

                // The receipts specify whether Apple or Google successfully received the
                // notification and information about an error, if one occurred.
                for (let receiptId in receipts) {
                    let { status, details } = receipts[receiptId];
                    if (status === 'ok') {
                        continue;
                    } else if (status === 'error') {
                        console
                            .error
                            //`There was an error sending a notification: ${message}`
                            ();
                        if (details && details) {
                            // The error codes are listed in the Expo documentation:
                            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
                            // You must handle the errors appropriately.
                            console.error(`The error code is ${details}`);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
}
