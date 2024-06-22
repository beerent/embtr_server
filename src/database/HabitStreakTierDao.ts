import { prisma } from '@database/prisma';
import { UpdateHabitStreakTier } from '@resources/types/requests/HabitStreakTypes';

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

    public static async update(tierId: number, data: UpdateHabitStreakTier) {
        return prisma.habitStreakTier.update({
            where: {
                id: tierId
            },
            data: {
                minStreak: data.minStreak,
                maxStreak: data.maxStreak,
                backgroundColor: data.backgroundColor,
                icon: {
                    ...(data.iconId && {
                        connect: {
                            id: data.iconId
                        }
                    }),
                    ...(!data.iconId && {
                        disconnect: true
                    })
                },
                badge: {
                    ...(data.badgeId && {
                        connect: {
                            id: data.badgeId
                        }
                    }),
                    ...(!data.badgeId && {
                        disconnect: true
                    })
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
}
