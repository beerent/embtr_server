import { prisma } from '@database/prisma';

export class UserBadgeDao {
    public static async create(userId: number, badgeId: number) {
        return await prisma.userBadge.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                badge: {
                    connect: {
                        id: badgeId,
                    },
                },
            },
        });
    }

    public static async getAll(userId: number) {
        return await prisma.userBadge.findMany({
            where: {
                userId,
            },
        });
    }

    public static async exists(userId: number, badgeId: number) {
        return await prisma.userBadge.findUnique({
            where: {
                unique_user_badge: {
                    userId,
                    badgeId,
                },
            },
        });
    }

    public static async contains(userId: number, badgeIds: number[]) {
        return await prisma.userBadge.findFirst({
            where: {
                userId,
                badgeId: {
                    in: badgeIds,
                },
            },
        });
    }

    public static async delete(userId: number, badgeId: number) {
        return await prisma.userBadge.delete({
            where: {
                unique_user_badge: {
                    userId,
                    badgeId,
                },
            },
        });
    }
}
