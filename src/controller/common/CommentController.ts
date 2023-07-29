import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { Interactable } from '@resources/types/interactable/Interactable';

export type CreateCommentResult = Prisma.PromiseReturnType<typeof CommentController.create>;

export class CommentController {
    public static async create(
        interactable: Interactable,
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

        if (interactable === Interactable.PLANNED_DAY_RESULT) {
            data.plannedDayResults = {
                connect: {
                    id: targetId,
                },
            };
        } else if (interactable === Interactable.USER_POST) {
            data.userPosts = {
                connect: {
                    id: targetId,
                },
            };
        } else if (interactable === Interactable.CHALLENGE) {
            data.challenges = {
                connect: {
                    id: targetId,
                },
            };
        }

        const result = await prisma.comment.create({
            data,
            include: {
                user: true,
                userPosts: true,
                challenges: true,
                plannedDayResults: {
                    include: {
                        plannedDay: true,
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
