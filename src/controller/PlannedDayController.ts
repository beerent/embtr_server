import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export const PlannedDayInclude = {
    user: true,
    plannedTasks: {
        where: {
            active: true,
        },
        include: {
            task: true,
            plannedDay: true,
            habit: true,
            unit: true,
        },
    },
    plannedDayResults: true,
    hiddenPlannedDayResultRecommendations: true,
} satisfies Prisma.PlannedDayInclude;

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

    public static async getByUserAndDayKey(userId: number, dayKey: string) {
        return await prisma.plannedDay.findUnique({
            where: {
                unique_user_daykey: {
                    userId,
                    dayKey,
                },
            },
            include: PlannedDayInclude,
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
        } catch (error) {
        }
    }
}
