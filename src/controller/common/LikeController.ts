import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { Interactable } from '@resources/types/interactable/Interactable';

export class LikeController {
    public static async create(interactable: Interactable, userId: number, id: number) {
        const data: Prisma.LikeCreateInput = {
            user: {
                connect: {
                    id: userId,
                },
            },
        };

        if (interactable === Interactable.PLANNED_DAY_RESULT) {
            data.plannedDayResults = {
                connect: {
                    id,
                },
            };
        } else if (interactable === Interactable.USER_POST) {
            data.userPosts = {
                connect: {
                    id,
                },
            };
        } else if (interactable === Interactable.QUOTE_OF_THE_DAY) {
            data.quoteOfTheDays = {
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
                quoteOfTheDays: true,
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

    public static async exists(interactable: Interactable, userId: number, targetId: number) {
        const where: Prisma.LikeWhereInput = {
            userId,
            active: true,
        };

        if (interactable === Interactable.PLANNED_DAY_RESULT) {
            where.plannedDayResults = {
                some: {
                    id: targetId,
                },
            };
        } else if (interactable === Interactable.USER_POST) {
            where.userPosts = {
                some: {
                    id: targetId,
                },
            };
        } else if (interactable === Interactable.QUOTE_OF_THE_DAY) {
            where.quoteOfTheDays = {
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
