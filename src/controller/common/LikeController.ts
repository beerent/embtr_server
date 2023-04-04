import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export enum LikableType {
    PLANNED_DAY_RESULT,
    USER_POST,
}

export class LikeController {
    public static async create(type: LikableType, userId: number, id: number) {
        const data: Prisma.LikeCreateInput = {
            user: {
                connect: {
                    id: userId,
                },
            },
        };

        if (type === LikableType.PLANNED_DAY_RESULT) {
            data.plannedDayResults = {
                connect: {
                    id,
                },
            };
        } else if (type === LikableType.USER_POST) {
            data.userPosts = {
                connect: {
                    id,
                },
            };
        }

        const result = await prisma.like.create({
            data,
            include: {
                user: true,
                userPosts: true,
                plannedDayResults: {
                    include: {
                        plannedDay: true,
                    },
                },
            },
        });

        return result;
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

    public static async exists(type: LikableType, userId: number, targetId: number) {
        const where: Prisma.LikeWhereInput = {
            userId,
            active: true,
        };

        if (type === LikableType.PLANNED_DAY_RESULT) {
            where.plannedDayResults = {
                some: {
                    id: targetId,
                },
            };
        } else if (type === LikableType.USER_POST) {
            where.userPosts = {
                some: {
                    id: targetId,
                },
            };
        }

        const result = await prisma.like.findFirst({
            where: where,
        });

        return result !== null;
    }
}
