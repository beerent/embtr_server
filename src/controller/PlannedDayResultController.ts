import { prisma } from '@database/prisma';
import { PlannedDayInclude } from './PlannedDayController';
import { Prisma } from '@prisma/client';
import { PlannedDayResult as PlannedDayResultModel } from '@resources/schema';

export type PlannedDayResultFull = Prisma.PromiseReturnType<typeof PlannedDayResultController.getById>;

export const PlannedDayResultInclude = {
    plannedDayResultComments: {
        where: {
            active: true,
        },
        include: {
            user: true,
            plannedDayResult: true,
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
    plannedDayResultLikes: {
        where: {
            active: true,
        },
        include: {
            user: true,
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
        const description = this.createDescriptionUpdate(plannedDayResult);
        const active = this.createActiveUpdate(plannedDayResult);
        const plannedDayResultImages = this.createPlannedDayResultImagesUpdate(plannedDayResult);
        const plannedDayResultComments = this.createPlannedDayResultCommentsUpdate(plannedDayResult);
        const plannedDayResultLikes = this.createPlannedDayResultLikesUpdate(plannedDayResult);

        const result = await prisma.plannedDayResult.update({
            where: { id: plannedDayResult.id },
            data: {
                ...description,
                ...active,
                plannedDayResultImages,
                plannedDayResultComments: plannedDayResultComments,
                plannedDayResultLikes: plannedDayResultLikes,
            },
            include: PlannedDayResultInclude,
        });

        return result;
    }

    public static async getAll() {
        return await prisma.plannedDayResult.findMany({
            where: {
                active: true,
            },
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
                active: true,
                plannedDay: {
                    userId,
                    dayKey,
                },
            },
            include: PlannedDayResultInclude,
        });
    }

    private static createDescriptionUpdate(plannedDayResult: PlannedDayResultModel) {
        const description = plannedDayResult.description;
        if (!description) {
            return {};
        }

        return { description };
    }

    private static createActiveUpdate(plannedDayResult: PlannedDayResultModel) {
        const active = plannedDayResult.active;
        if (active === undefined) {
            return {};
        }

        return { active };
    }

    private static createPlannedDayResultImagesUpdate(plannedDayResult: PlannedDayResultModel) {
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

    private static createPlannedDayResultCommentsUpdate(plannedDayResult: PlannedDayResultModel) {
        const comments = plannedDayResult.plannedDayResultComments;
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

    private static createPlannedDayResultLikesUpdate(plannedDayResult: PlannedDayResultModel) {
        const likes = plannedDayResult.plannedDayResultLikes;
        if (!likes) {
            return {};
        }

        return {
            create: likes
                .filter((like) => like.userId && !like.id)
                .map((like) => ({
                    user: {
                        connect: {
                            id: like.userId!,
                        },
                    },
                })),
        };
    }
}
