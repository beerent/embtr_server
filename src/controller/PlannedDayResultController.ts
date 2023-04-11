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
        const active = plannedDayResult.active !== undefined ? { active: plannedDayResult.active } : {};
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

    public static async getAllForUser(userId: number) {
        return await prisma.plannedDayResult.findMany({
            where: {
                plannedDay: {
                    userId,
                },
                active: true,
            },
            include: PlannedDayResultInclude,
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
                active: true,
                plannedDay: {
                    userId,
                    dayKey,
                },
            },
            include: PlannedDayResultInclude,
        });
    }
}
