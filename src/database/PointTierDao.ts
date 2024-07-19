import { prisma } from '@database/prisma';

export class PointTierDao {
    public static async getAll() {
        return prisma.pointTier.findMany();
    }

    public static async getByPoints(points: number) {
        return prisma.pointTier.findFirst({
            where: {
                minPoints: {
                    lte: points,
                },
                maxPoints: {
                    gte: points,
                },
            },
        });
    }

    public static async getByLevel(level: number) {
        return prisma.pointTier.findUnique({
            where: {
                level,
            },
            include: {
                badge: {
                    include: {
                        icon: true,
                    },
                },
            },
        });
    }
}
