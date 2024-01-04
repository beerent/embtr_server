import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { PlannedDayResult as PlannedDayResultModel } from '@resources/schema';
import { CommonUpserts } from './CommonUpserts';

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
    },
    plannedDay: {
        include: {
            challengeParticipant: {
                include: {
                    challenge: {
                        include: {
                            challengeRewards: true,
                        },
                    },
                },
            },
            user: true,
            plannedTasks: {
                where: {
                    active: true,
                },
                include: {
                    unit: true,
                },
            },
        },
    },
} satisfies Prisma.PlannedDayResultInclude;

export type PlannedDayResultsType = Prisma.PromiseReturnType<
    typeof PlannedDayResultDao.getAll
>;
export type PlannedDayResultType = Prisma.PromiseReturnType<
    typeof PlannedDayResultDao.getById
>;

export class PlannedDayResultDao {
    public static async create(plannedDayId: number, title?: string) {
        return prisma.plannedDayResult.create({
            data: {
                title,
                plannedDay: {
                    connect: {
                        id: plannedDayId,
                    },
                },
            },
            include: PlannedDayResultInclude,
        });
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
        const description = plannedDayResult.description
            ? { description: plannedDayResult.description }
            : {};
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

    public static async getAll(upperBound: Date, lowerBound: Date) {
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
}
