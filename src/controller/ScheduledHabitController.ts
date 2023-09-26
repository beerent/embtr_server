import { prisma } from '@database/prisma';

export class ScheduledHabitController {
    public static async create(
        userId: number,
        taskId: number,
        description?: string,
        quantity?: number,
        unitId?: number,
        daysOfWeekIds?: number[],
        timesOfDayIds?: number[]
    ) {
        const unit = unitId
            ? {
                  unit: {
                      connect: {
                          id: unitId ?? 1,
                      },
                  },
              }
            : {};
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
