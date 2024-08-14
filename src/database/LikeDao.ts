import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { Constants } from '@resources/types/constants/constants';

export class LikeDao {
    public static async create(interactable: Constants.Interactable, userId: number, id: number) {
        const data: Prisma.LikeCreateInput = {
            user: {
                connect: {
                    id: userId,
                },
            },
        };

        if (interactable === Constants.Interactable.PLANNED_DAY_RESULT) {
            data.plannedDayResults = {
                connect: {
                    id,
                },
            };
        } else if (interactable === Constants.Interactable.USER_POST) {
            data.userPosts = {
                connect: {
                    id,
                },
            };
        } else if (interactable === Constants.Interactable.QUOTE_OF_THE_DAY) {
            data.quoteOfTheDays = {
                connect: {
                    id,
                },
            };
        } else if (interactable === Constants.Interactable.CHALLENGE) {
            data.challenges = {
                connect: {
                    id,
                },
            };
        } else if (interactable === Constants.Interactable.FEATURED_POST) {
            data.featuredPosts = {
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
                challenges: true,
                featuredPosts: true,
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

    public static async exists(
        interactable: Constants.Interactable,
        userId: number,
        targetId: number
    ) {
        console.log('exists', interactable, userId, targetId);
        const where: Prisma.LikeWhereInput = {
            userId,
            active: true,
        };

        if (interactable === Constants.Interactable.PLANNED_DAY_RESULT) {
            where.plannedDayResults = {
                some: {
                    id: targetId,
                },
            };
        } else if (interactable === Constants.Interactable.USER_POST) {
            where.userPosts = {
                some: {
                    id: targetId,
                },
            };
        } else if (interactable === Constants.Interactable.QUOTE_OF_THE_DAY) {
            where.quoteOfTheDays = {
                some: {
                    id: targetId,
                },
            };
        } else if (interactable === Constants.Interactable.CHALLENGE) {
            where.challenges = {
                some: {
                    id: targetId,
                },
            };
        } else if (interactable === Constants.Interactable.FEATURED_POST) {
            where.featuredPosts = {
                some: {
                    id: targetId,
                },
            };
        }

        console.log('where', where);

        const result = await prisma.like.findFirst({
            where: where,
        });

        return result !== null;
    }
}
