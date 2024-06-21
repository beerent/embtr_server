import { prisma } from '@database/prisma';

export class HabitStreakTierDao {
    public static async get(id: number) {
        return prisma.habitStreakTier.findUnique({
            where: {
                id,
            },
        });
    }

    public static async getAllWithBadge() {
        return prisma.habitStreakTier.findMany({
            where: {
                badgeId: {
                    not: null,
                },
            },
            include: {
                badge: {
                    include: {
                        icon: true,
                    },
                },
                icon: true,
            },
        });
    }

    public static async getAll() {
        return prisma.habitStreakTier.findMany({
            include: {
                badge: {
                    include: {
                        icon: true,
                    },
                },
                icon: true,
            },
        });
    }
}
