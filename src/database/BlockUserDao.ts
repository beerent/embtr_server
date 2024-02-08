import { prisma } from '@database/prisma';

export class BlockUserDao {
    public static async create(fromUserId: number, toUserId: number) {
        return prisma.blockedUser.create({
            data: {
                user: {
                    connect: {
                        id: fromUserId,
                    },
                },
                blockedUser: {
                    connect: {
                        id: toUserId,
                    },
                },
            },
        });
    }

    public static async exists(fromUserId: number, toUserId: number) {
        return (
            (await prisma.blockedUser.findFirst({
                where: {
                    userId: fromUserId,
                    blockedUserId: toUserId,
                },
            })) !== null
        );
    }

    public static async getBlockedUserIds(userId: number): Promise<number[]> {
        const results = await prisma.blockedUser.findMany({
            where: {
                userId: userId,
            },
            select: {
                blockedUserId: true,
            },
        });

        return results.map((result) => result.blockedUserId);
    }

    public static async getBlockedByUserIds(userId: number): Promise<number[]> {
        const results = await prisma.blockedUser.findMany({
            where: {
                blockedUserId: userId,
            },
            select: {
                userId: true,
            },
        });

        return results.map((result) => result.userId);
    }
}
