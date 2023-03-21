import { prisma } from '@database/prisma';
import { PlannedDayInclude } from './PlannedDayController';
import { PlannedDayResultImage, Prisma } from '@prisma/client';
import { PlannedDayResultModel } from '@resources/models/PlannedDayResultModel';

export type PlannedDayResultFull = Prisma.PromiseReturnType<typeof PlannedDayResultController.getById>;

export const PlannedDayResultInclude = {
    plannedDayResultImages: {
        include: {
            plannedDayResult: true,
        },
    },
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

    public static async x() {
        return await prisma.plannedDayResultImage.findUnique({
            where: { id: 1 },
            include: {
                plannedDayResult: {
                    include: PlannedDayResultInclude,
                },
            },
        });
    }

    public static async update(plannedDayResult: PlannedDayResultModel) {
        const description = plannedDayResult.description !== undefined ? { description: plannedDayResult.description } : {};

        const plannedDayResultImages = {
            upsert: plannedDayResult.plannedDayResultImages
                ?.filter((image) => image.url !== undefined)
                .map((image) => ({
                    where: { id: image.id ?? -1 },
                    create: { url: image.url! },
                    update: { url: image.url! },
                })),
        };

        const result = await prisma.plannedDayResult.update({
            where: { id: plannedDayResult.id },
            data: {
                ...description,
                plannedDayResultImages,
            },
            include: PlannedDayResultInclude,
        });

        return result;
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
