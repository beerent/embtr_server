import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export type PlannedDayWithUserReturnType = Prisma.PromiseReturnType<typeof PlannedDayController.get>;

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
        });
    }

    public static async get(id: number) {
        return await prisma.plannedDay.findUnique({
            where: {
                id: id,
            },
            include: {
                user: true,
            },
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
            include: {
                user: true,
            },
        });
    }

    public static async deleteByUserAndDayKey(userId: number, dayKey: string) {
        await prisma.plannedDay.delete({
            where: {
                unique_user_daykey: {
                    userId: userId,
                    dayKey: dayKey,
                },
            },
        });
    }
}
