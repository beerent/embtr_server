import { prisma } from '@database/prisma';
import { PlannedDay, User } from '@prisma/client';
import { PlannedTaskFull } from './PlannedTaskController';

export type PlannedDayFull = (PlannedDay & { user: User; plannedTasks: PlannedTaskFull[] }) | null;

export class PlannedDayController {
    public static async create(userId: number, date: Date, dayKey: string) {
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
            include: {
                user: true,
                plannedTasks: {
                    include: {
                        task: true,
                        plannedDay: true,
                    },
                },
            },
        });
    }

    public static async get(id: number): Promise<PlannedDayFull> {
        return await prisma.plannedDay.findUnique({
            where: {
                id: id,
            },
            include: {
                user: true,
                plannedTasks: {
                    where: {
                        active: true,
                    },
                    include: {
                        task: true,
                        plannedDay: true,
                    },
                },
            },
        });
    }

    public static async getByUserAndDayKey(userId: number, dayKey: string): Promise<PlannedDayFull> {
        return await prisma.plannedDay.findUnique({
            where: {
                unique_user_daykey: {
                    userId,
                    dayKey,
                },
            },
            include: {
                user: true,
                plannedTasks: {
                    where: {
                        active: true,
                    },
                    include: {
                        task: true,
                        plannedDay: true,
                    },
                },
            },
        });
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
        } catch (error) {}
    }
}
