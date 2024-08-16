import { prisma } from '@database/prisma';

export class PushNotificationReceiptDao {
    public static async create(message: string, toUserId: number, fromUserId?: number) {
        return await prisma.pushNotificationReceipt.create({
            data: {
                toUser: {
                    connect: {
                        id: toUserId,
                    },
                },

                fromUser: fromUserId
                    ? {
                        connect: {
                            id: fromUserId,
                        },
                    }
                    : undefined,
                message: message,
            },
        });
    }
}
