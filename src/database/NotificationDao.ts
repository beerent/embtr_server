import { prisma } from '@database/prisma';
import { NotificationTargetPage } from '@prisma/client';
import { NotificationTargetPage as NotificationTargetPageModel } from '@resources/schema';

export class NotificationDao {
    public static async create(
        toUser: number,
        fromUser: number,
        summary: string,
        targetPage: NotificationTargetPageModel,
        targetId: number
    ) {
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
            include: {
                toUser: {
                    include: {
                        pushNotificationTokens: true,
                    },
                },
                fromUser: true,
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
            orderBy: {
                createdAt: 'desc',
            },
            take: 10,
        });

        return result;
    }

    public static async countAllUnread(userId: number) {
        const result = await prisma.notification.count({
            where: {
                toUser: {
                    id: userId,
                },
                read: false,
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
            orderBy: {
                createdAt: 'desc',
            },
        });

        return result;
    }

    public static async clearAll(userId: number) {
        const result = await prisma.notification.updateMany({
            where: {
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
