import { prisma } from '@database/prisma';
import { NotificationTargetPage } from '@prisma/client';
import { Notification, NotificationTargetPage as NotificationTargetPageModel } from '@resources/schema';

export class NotificationController {
    public static async create(toUser: number, fromUser: number, summary: string, targetPage: NotificationTargetPageModel, targetId: number): Promise<any> {
        const result = await prisma.notification.create({
            data: {
                toUser: {
                    connect: {
                        id: toUser,
                    },
                },
                fromUser: {
                    connect: {
                        id: fromUser,
                    },
                },

                summary,
                targetPage: targetPage as NotificationTargetPage,
                targetId,
            },
        });

        return result;
    }

    public static async getAll(userId: number) {
        const result = await prisma.notification.findMany({
            where: {
                toUser: {
                    id: userId,
                },
            },
            include: {
                fromUser: true,
            },
        });

        return result;
    }

    public static async getAllById(notificationIds: number[], userId: number) {
        const result = await prisma.notification.findMany({
            where: {
                id: {
                    in: notificationIds,
                },
                toUser: {
                    id: userId,
                },
            },
            include: {
                fromUser: true,
            },
        });

        return result;
    }

    public static async clearAll(notificationIds: number[], userId: number) {
        const result = await prisma.notification.updateMany({
            where: {
                id: {
                    in: notificationIds,
                },
                toUser: {
                    id: userId,
                },
            },
            data: {
                read: true,
            },
        });

        return result;
    }
}
