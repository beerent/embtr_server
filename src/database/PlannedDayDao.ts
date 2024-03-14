import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export const PlannedDayGetInclude = {
    user: true,
    plannedTasks: {
        include: {
            scheduledHabit: true,
            plannedDay: true,
            unit: true,
            timeOfDay: true,
            originalTimeOfDay: true,
        },
    },
    plannedDayResults: {
        include: {
            images: true,
        },
        where: {
            active: true,
        },
    },
} satisfies Prisma.PlannedDayInclude;

export const PlannedDayInclude = {
    user: true,
    plannedTasks: {
        where: {
            active: true,
        },
        include: {
            scheduledHabit: true,
            plannedDay: true,
            unit: true,
        },
    },
    plannedDayResults: {
        include: {
            images: true,
        },
    },
} satisfies Prisma.PlannedDayInclude;

export class PlannedDayDao {
    public static async create(userId: number, dayKey: string) {
        const date = new Date(dayKey);

        return await prisma.plannedDay.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                dayKey,
                date,
            },
            include: PlannedDayInclude,
        });
    }

    public static async get(id: number) {
        return await prisma.plannedDay.findUnique({
            where: {
                id: id,
            },
            include: PlannedDayInclude,
        });
    }

    public static async findByUserAndDayKey(userId: number, dayKey: string) {
        return await prisma.plannedDay.findFirst({
            where: {
                userId,
                dayKey,
            },
            include: PlannedDayInclude,
        });
    }

    public static async existsByUserAndDayKey(userId: number, dayKey: string) {
        const plannedDay = await this.findByUserAndDayKey(userId, dayKey);
        return plannedDay !== null;
    }

    //todo - fix this
    public static async getByUserAndDayKey(userId: number, dayKey: string) {
        const date = new Date(dayKey);

        const plannedDayUpsert = await prisma.plannedDay.upsert({
            where: {
                unique_user_daykey: {
                    userId,
                    dayKey,
                },
            },
            update: {},
            create: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                dayKey,
                date,
            },
            include: PlannedDayInclude,
        });

        return plannedDayUpsert;
    }

    public static async getOrCreateByUserAndDayKey(userId: number, dayKey: string) {
        const date = new Date(dayKey);

        const plannedDayUpsert = await prisma.plannedDay.upsert({
            where: {
                unique_user_daykey: {
                    userId,
                    dayKey,
                },
            },
            update: {},
            create: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                dayKey,
                date,
            },
            include: PlannedDayGetInclude,
        });

        return plannedDayUpsert;
    }

    public static async deleteByUserAndDayKey(userId: number, dayKey: string) {
        try {
            await prisma.plannedDay.delete({
                where: {
                    unique_user_daykey: {
                        userId: userId,
                        dayKey: dayKey,
                    },
                },
            });
        } catch (error) { }
    }

    public static async getByUserInDateRange(userId: number, startDate: Date, endDate: Date) {
        const plannedDays = await prisma.plannedDay.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                plannedTasks: true,
            },
        });

        return plannedDays;
    }
}
