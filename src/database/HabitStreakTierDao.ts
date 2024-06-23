import { prisma } from '@database/prisma';
import { HabitStreakTier } from '@resources/schema';

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

    public static async create(habitStreakTier: HabitStreakTier) {
        return prisma.habitStreakTier.create({
            data: {
                name: habitStreakTier.name ?? '',
                minStreak: habitStreakTier.minStreak ?? 0,
                maxStreak: habitStreakTier.maxStreak ?? 0,
                backgroundColor: habitStreakTier.backgroundColor ?? '',
                icon: {
                    ...(habitStreakTier.iconId && {
                        connect: {
                            id: habitStreakTier.iconId,
                        },
                    }),
                },
                badge: {
                    ...(habitStreakTier.badgeId && {
                        connect: {
                            id: habitStreakTier.badgeId,
                        },
                    }),
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

    public static async update(tierId: number, habitStreakTier: HabitStreakTier) {
        return prisma.habitStreakTier.update({
            where: {
                id: tierId,
            },
            data: {
                name: habitStreakTier.name,
                minStreak: habitStreakTier.minStreak,
                maxStreak: habitStreakTier.maxStreak,
                backgroundColor: habitStreakTier.backgroundColor,
                icon: {
                    ...(habitStreakTier.iconId && {
                        connect: {
                            id: habitStreakTier.iconId,
                        },
                    }),
                    ...(!habitStreakTier.iconId && {
                        disconnect: true,
                    }),
                },
                badge: {
                    ...(habitStreakTier.badgeId && {
                        connect: {
                            id: habitStreakTier.badgeId,
                        },
                    }),
                    ...(!habitStreakTier.badgeId && {
                        disconnect: true,
                    }),
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

    public static async delete(tierId: number) {
        return prisma.habitStreakTier.delete({
            where: {
                id: tierId
            }
        })
    }
}
