import { prisma } from '@database/prisma';

export class ScheduledHabitController {
    public static async create(
        userId: number,
        taskId: number,
        description?: string,
        quantity?: number,
        unitId?: number,
        daysOfWeekIds?: number[],
        timesOfDayIds?: number[],
        startDate?: Date,
        endDate?: Date
    ) {
        let unit = {};
        if (unitId) {
            unit = {
                unit: {
                    connect: {
                        id: unitId ?? 1,
                    },
                },
            };
        }

        return await prisma.scheduledHabit.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                task: {
                    connect: {
                        id: taskId,
                    },
                },
                ...unit,
                description: description,
                quantity: quantity ?? 1,
                daysOfWeek: {
                    connect: daysOfWeekIds?.map((id) => {
                        return {
                            id,
                        };
                    }),
                },
                timesOfDay: {
                    connect: timesOfDayIds?.map((id) => {
                        return {
                            id,
                        };
                    }),
                },
                startDate,
                endDate,
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async getForUserAndDayOfWeek(userId: number, dayOfWeek: number) {
        return await prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
                daysOfWeek: {
                    some: {
                        id: dayOfWeek,
                    },
                },
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }
}
