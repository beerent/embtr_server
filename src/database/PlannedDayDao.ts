import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { PlannedDay } from '@resources/schema';
import { DayKeyUtility } from '@src/utility/date/DayKeyUtility';

export interface QueryResults {
    date: Date;
    status: string;
}

export const PlannedDayGetInclude = {
    user: true,
    plannedTasks: {
        include: {
            icon: true,
            scheduledHabit: {
                include: {
                    icon: true,
                    task: {
                        select: {
                            icon: true,
                            type: true,
                        },
                    },
                },
            },
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

    public static async getByUserAndDayKey(userId: number, dayKey: string) {
        const results = await prisma.plannedDay.findUnique({
            where: {
                unique_user_daykey: {
                    userId,
                    dayKey,
                },
            },
            include: PlannedDayGetInclude,
        });

        return results;
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
                plannedTasks: {
                    include: {
                        scheduledHabit: true,
                    },
                },
            },
        });

        return plannedDays;
    }

    public static async update(plannedDay: PlannedDay) {
        return await prisma.plannedDay.update({
            where: {
                id: plannedDay.id,
            },
            data: {
                status: plannedDay.status,
            },
        });
    }

    public static async getPlannedDayIdsWithMissingStatusesForUser(userId: number) {
        const plannedDays = await prisma.plannedDay.findMany({
            where: {
                userId,
                status: null,
            },
            select: {
                id: true,
            },
        });

        return plannedDays.map((plannedDay) => plannedDay.id);
    }

    public static async getPlannedDayIdsForUser(userId: number): Promise<number[]> {
        const plannedDays = await prisma.plannedDay.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
            },
        });

        return plannedDays.map((plannedDay) => plannedDay.id);
    }

    public static async getFirst(userId: number) {
        return await prisma.plannedDay.findFirst({
            where: {
                userId,
            },
            orderBy: {
                date: 'asc',
            },
            include: PlannedDayInclude,
        });
    }

    public static async countComplete(userId: number) {
        return await prisma.plannedDay.count({
            where: {
                userId,
                status: 'COMPLETE',
            },
        });
    }

    public static async getCompletionStatusesForDateRange(
        userId: number,
        startDate: Date,
        endDate: Date
    ) {
        const startDateString = startDate
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '')
            .split(' ')[0];
        const endDateString = endDate
            .toISOString()
            .replace('T', ' ')
            .replace('Z', '')
            .split(' ')[0];

        const results: QueryResults[] = await prisma.$queryRaw(
            Prisma.sql`
                SELECT all_dates.date, p.status
                FROM (
                    SELECT DATE(${startDateString}) + INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY AS date
                    FROM (
                        SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
                    ) AS a
                    CROSS JOIN (
                        SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
                    ) AS b
                    CROSS JOIN (
                        SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
                    ) AS c
                    WHERE DATE(${startDateString}) + INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY BETWEEN ${startDateString} AND ${endDateString}
                ) AS all_dates
                LEFT JOIN planned_day AS p ON all_dates.date = p.date
                WHERE p.userId = ${userId}
                ORDER BY all_dates.date ASC;
            `
        );

        const dateToStatus: { [key: string]: string } = {};
        results.forEach((result) => {
            dateToStatus[DayKeyUtility.getDayKey(result.date)] = result.status;
        });

        return dateToStatus;
    }
}
