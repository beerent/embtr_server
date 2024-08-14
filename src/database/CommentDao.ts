import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { Constants } from '@resources/types/constants/constants';

export class CommentDao {
    public static async create(
        interactable: Constants.Interactable,
        userId: number,
        targetId: number,
        comment: string
    ) {
        const data: Prisma.CommentCreateInput = {
            comment,
            user: {
                connect: {
                    id: userId,
                },
            },
        };

        if (interactable === Constants.Interactable.PLANNED_DAY_RESULT) {
            data.plannedDayResults = {
                connect: {
                    id: targetId,
                },
            };
        } else if (interactable === Constants.Interactable.USER_POST) {
            data.userPosts = {
                connect: {
                    id: targetId,
                },
            };
        } else if (interactable === Constants.Interactable.CHALLENGE) {
            data.challenges = {
                connect: {
                    id: targetId,
                },
            };
        } else if (interactable === Constants.Interactable.FEATURED_POST) {
            data.featuredPosts = {
                connect: {
                    id: targetId,
                },
            };
        }

        const result = await prisma.comment.create({
            data,
            include: {
                user: true,
                userPosts: {
                    include: {
                        comments: true,
                    },
                },
                challenges: {
                    include: {
                        comments: true,
                    },
                },
                plannedDayResults: {
                    include: {
                        plannedDay: true,
                        comments: true,
                    },
                },
            },
        });

        return result;
    }

    public static async get(id: number) {
        return await prisma.comment.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
    }

    public static async delete(id: number) {
        return await prisma.comment.update({
            where: {
                id,
            },
            data: {
                active: false,
            },
        });
    }
}
