import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { Image, PlannedDayResult as PlannedDayResultModel } from '@resources/schema';
import { CommonUpserts } from './CommonUpserts';

export const PlannedDayResultInclude = {
    comments: {
        where: {
            active: true,
        },
        include: {
            user: {
                include: {
                    roles: true,
                },
            },
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
    },
    plannedDay: {
        include: {
            plannedDayChallengeMilestones: {
                include: {
                    challengeMilestone: {
                        include: {
                            challenge: true,
                            milestone: true,
                        },
                    },
                },
            },
            challengeParticipant: {
                include: {
                    challenge: {
                        include: {
                            award: true,
                        },
                    },
                },
            },
            user: {
                include: {
                    roles: true,
                },
            },
            plannedTasks: {
                where: {
                    active: true,
                },
                include: {
                    unit: true,
                    scheduledHabit: {
                        select: {
                            task: {
                                select: {
                                    type: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
} satisfies Prisma.PlannedDayResultInclude;

export type PlannedDayResultsType = Prisma.PromiseReturnType<typeof PlannedDayResultDao.getAll>;
export type PlannedDayResultType = Prisma.PromiseReturnType<typeof PlannedDayResultDao.getById>;

export class PlannedDayResultDao {
    public static async create(plannedDayId: number, description: string, images: Image[]) {
        const imageInserts = CommonUpserts.createImagesInserts(images ?? []);

        const result = await prisma.plannedDayResult.create({
            data: {
                plannedDayId,
                description,
                images: imageInserts,
            },
        });

        return result;
    }

    public static async getAllByIds(ids: number[]) {
        return prisma.plannedDayResult.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            include: PlannedDayResultInclude,
        });
    }

    public static async update(plannedDayResult: PlannedDayResultModel) {
        const descriptionExists =
            plannedDayResult.description !== undefined && plannedDayResult.description !== null;
        const description = descriptionExists ? { description: plannedDayResult.description } : {};

        const active =
            plannedDayResult.active !== undefined ? { active: plannedDayResult.active } : {};
        const createdAt =
            plannedDayResult.createdAt !== undefined
                ? { createdAt: plannedDayResult.createdAt }
                : {};
        const images = CommonUpserts.createImagesUpserts(plannedDayResult.images ?? []);
        const likes = CommonUpserts.createLikesUpserts(plannedDayResult.likes ?? []);
        const comments = CommonUpserts.createCommentsUpserts(plannedDayResult.comments ?? []);

        const result = await prisma.plannedDayResult.update({
            where: { id: plannedDayResult.id },
            data: {
                ...description,
                ...active,
                ...createdAt,
                images,
                likes,
                comments,
            },
            include: PlannedDayResultInclude,
        });

        return result;
    }

    public static async getAll(lowerBound: Date, upperBound: Date) {
        return await prisma.plannedDayResult.findMany({
            where: {
                active: true,
                createdAt: {
                    gte: lowerBound,
                    lte: upperBound,
                },
            },
            include: PlannedDayResultInclude,
        });
    }

    public static async getAllForUser(userId: number) {
        return await prisma.plannedDayResult.findMany({
            where: {
                plannedDay: {
                    userId,
                },
                active: true,
            },
            include: PlannedDayResultInclude,
            orderBy: {
                id: 'desc',
            },
        });
    }

    public static async getById(id: number) {
        const result = await prisma.plannedDayResult.findUnique({
            where: {
                id: id,
            },
            include: PlannedDayResultInclude,
        });

        return result;
    }

    public static async existsById(id: number) {
        return (await this.getById(id)) !== null;
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

    public static async count(userId: number) {
        return await prisma.plannedDayResult.count({
            where: {
                plannedDay: {
                    userId,
                },
                active: true,
            },
        });
    }
}
