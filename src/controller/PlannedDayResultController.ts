import { prisma } from '@database/prisma';
import { PlannedDayInclude } from './PlannedDayController';
import { Prisma } from '@prisma/client';
import { PlannedDayResultComment as PlannedDayResultCommentModel, PlannedDayResult as PlannedDayResultModel } from '@resources/schema';

export type PlannedDayResultFull = Prisma.PromiseReturnType<typeof PlannedDayResultController.getById>;

export const PlannedDayResultInclude = {
    PlannedDayResultComments: {
        where: {
            active: true,
        },
        include: {
            plannedDayResult: true,
            user: true,
        },
    },
    plannedDayResultImages: {
        where: {
            active: true,
        },
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

    public static async update(plannedDayResult: PlannedDayResultModel) {
        const description = await this.createDescriptionUpdate(plannedDayResult);
        const plannedDayResultImages = await this.createPlannedDayResultImagesUpdate(plannedDayResult);
        const plannedDayResultComments = await this.createPlannedDayResultCommentsUpdate(plannedDayResult);

        const result = await prisma.plannedDayResult.update({
            where: { id: plannedDayResult.id },
            data: {
                ...description,
                plannedDayResultImages,
                PlannedDayResultComments: plannedDayResultComments,
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

    private static async createDescriptionUpdate(plannedDayResult: PlannedDayResultModel) {
        const description = plannedDayResult.description;
        if (!description) {
            return {};
        }

        return { description };
    }

    private static async createPlannedDayResultImagesUpdate(plannedDayResult: PlannedDayResultModel) {
        const images = plannedDayResult.plannedDayResultImages;
        if (!images) {
            return {};
        }

        return {
            upsert: plannedDayResult.plannedDayResultImages
                ?.filter((image) => image.url !== undefined)
                .map((image) => ({
                    where: { id: image.id ?? -1 },
                    create: { url: image.url! },
                    update: { url: image.url!, active: image.active ?? true },
                })),
        };
    }

    private static async createPlannedDayResultCommentsUpdate(plannedDayResult: PlannedDayResultModel) {
        const comments = plannedDayResult.PlannedDayResultComments;
        if (!comments) {
            return {};
        }

        return {
            create: comments
                .filter((comment) => comment.comment && !comment.id)
                .map((comment) => ({
                    comment: comment.comment!,
                    user: {
                        connect: {
                            id: comment.userId!,
                        },
                    },
                })),
        };
    }
}
