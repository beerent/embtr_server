import { prisma } from '@database/prisma';

export class LevelDao {
    public static async getAll() {
        return prisma.level.findMany({
            include: {
                badge: {
                    include: {
                        icon: true,
                    },
                },
            },
        });
    }

    public static async getByPoints(points: number) {
        return prisma.level.findFirst({
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
        return prisma.level.findUnique({
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
