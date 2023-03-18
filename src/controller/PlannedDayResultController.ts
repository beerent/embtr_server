import { prisma } from '@database/prisma';
import { PlannedDayInclude } from './PlannedDayController';
import { PlannedDay, Prisma } from '@prisma/client';

export type PlannedDayResultFull = Prisma.PromiseReturnType<typeof PlannedDayResultController.getById>;

export const PlannedDayResultInclude = {
    plannedDay: {
        include: PlannedDayInclude,
    },
} satisfies Prisma.PlannedDayResultInclude;

export class PlannedDayResultController {
    public static async create(plannedDayId: number) {
        return await prisma.plannedDayResult.create({
            data: {
                plannedDay: {
                    connect: {
                        id: plannedDayId,
                    },
                },
            },
            include: PlannedDayResultInclude,
        });
    }

    public static async getAll() {
        return await prisma.plannedDayResult.findMany({
            include: PlannedDayResultInclude,
        });
    }

    public static async getById(id: number) {
        return await prisma.plannedDayResult.findUnique({
            where: {
                id: id,
            },
            include: PlannedDayResultInclude,
        });
    }

    public static async getByUserAndDayKey(userId: number, dayKey: string) {
        return await prisma.plannedDayResult.findFirst({
            where: {
                plannedDay: {
                    userId,
                    dayKey,
                },
            },
            include: PlannedDayResultInclude,
        });
    }
}
