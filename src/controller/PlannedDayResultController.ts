import { prisma } from '@database/prisma';
import { PlannedDayInclude } from './PlannedDayController';
import { Prisma } from '@prisma/client';
import { PlannedDayResult as PlannedDayResultModel } from '@resources/schema';
import { CommonUpserts } from './common/CommonUpserts';

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
    likes: {
        where: {
            active: true,
        },
        include: {
            user: true,
        },
    },
    images: {
        where: {
            active: true,
        },
        include: {
            plannedDayResults: true,
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
        const description = plannedDayResult.description ? { description: plannedDayResult.description } : {};
        const active = plannedDayResult.active ? { active: plannedDayResult.active } : {};
        const images = CommonUpserts.createImagesUpserts(plannedDayResult.images ?? []);
        const likes = CommonUpserts.createLikesUpserts(plannedDayResult.likes ?? []);
        const comments = CommonUpserts.createCommentsUpserts(plannedDayResult.comments ?? []);

        const result = await prisma.plannedDayResult.update({
            where: { id: plannedDayResult.id },
            data: {
                ...description,
                ...active,
                images,
                likes,
                comments,
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

    /*
     * COMMENTS
     */
    public static async createComment(plannedDayResultId: number, userId: number, comment: string) {
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

    /*
     * LIKES
     */
    public static async createLike(plannedDayResultId: number, userId: number) {
        const result = await prisma.plannedDayResult.update({
            where: {
                id: plannedDayResultId,
            },
            data: {
                likes: {
                    create: {
                        user: {
                            connect: {
                                id: userId,
                            },
                        },
                    },
                },
            },
            include: {
                likes: {
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

        return result.likes[0];
    }

    public static async getLike(id: number) {
        return await prisma.like.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
    }

    public static async deleteLike(id: number) {
        return await prisma.like.update({
            where: {
                id,
            },
            data: {
                active: false,
            },
        });
    }
}
