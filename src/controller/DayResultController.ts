import { prisma } from '@database/prisma';
import { PlannedDayInclude } from './PlannedDayController';
import { PlannedDay, Prisma } from '@prisma/client';

export type DayResultFull = Prisma.PromiseReturnType<typeof DayResultController.getById>;

export const DayResultInclude = {
    plannedDay: {
        include: PlannedDayInclude,
    },
} satisfies Prisma.DayResultInclude;

export class DayResultController {
    public static async create(plannedDayId: number) {
        return await prisma.dayResult.create({
            data: {
                plannedDay: {
                    connect: {
                        id: plannedDayId,
                    },
                },
            },
            include: DayResultInclude,
        });
    }

    public static async getAll() {
        return await prisma.dayResult.findMany({
            include: DayResultInclude,
        });
    }

    public static async getById(id: number) {
        return await prisma.dayResult.findUnique({
            where: {
                id: id,
            },
            include: DayResultInclude,
        });
    }

    public static async getByUserAndDayKey(userId: number, dayKey: string) {
        return await prisma.dayResult.findFirst({
            where: {
                plannedDay: {
                    userId,
                    dayKey,
                },
            },
            include: DayResultInclude,
        });
    }
}
