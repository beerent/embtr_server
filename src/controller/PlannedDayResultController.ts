import { prisma } from '@database/prisma';
import { PlannedDayInclude } from './PlannedDayController';
import { Prisma } from '@prisma/client';
import { PlannedDayResult as PlannedDayResultModel } from '@resources/schema';

export type PlannedDayResultFull = Prisma.PromiseReturnType<typeof PlannedDayResultController.getById>;

export const PlannedDayResultInclude = {
    comments: {
        where: {
            active: true,
        },
        include: {
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

    public static async createComment(plannedDayResultId: number, comment: string, userId: number) {
        const result = await prisma.plannedDayResult.update({
            where: {
                id: plannedDayResultId,
            },
            data: {
                comments: {
                    create: {
                        comment,
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                },
            },
            include: {
                comments: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                    include: {
                        user: true,
                    },
                },
            },
        });

        return result.comments[0];
    }

    public static async getComment(id: number) {
        return await prisma.comment.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
    }

    public static async deleteComment(id: number) {
        return await prisma.comment.update({
            where: {
                id,
            },
            data: {
                active: false,
            },
        });
    }

    public static async update(plannedDayResult: PlannedDayResultModel) {
        const description = this.createDescriptionUpdate(plannedDayResult);
        const active = this.createActiveUpdate(plannedDayResult);
        const plannedDayResultImages = this.createPlannedDayResultImagesUpdate(plannedDayResult);
        const plannedDayResultLikes = this.createPlannedDayResultLikesUpdate(plannedDayResult);

        const result = await prisma.plannedDayResult.update({
            where: { id: plannedDayResult.id },
            data: {
                ...description,
                ...active,
                plannedDayResultImages,
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
