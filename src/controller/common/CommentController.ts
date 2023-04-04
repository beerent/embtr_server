import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export enum CommentableType {
    PLANNED_DAY_RESULT,
    USER_POST,
}

export class CommentController {
    public static async create(type: CommentableType, userId: number, targetId: number, comment: string) {
        const data: Prisma.CommentCreateInput = {
            comment,
            user: {
                connect: {
                    id: userId,
                },
            },
        };

        if (type === CommentableType.PLANNED_DAY_RESULT) {
            data.plannedDayResults = {
                connect: {
                    id: targetId,
                },
            };
        } else if (type === CommentableType.USER_POST) {
            data.userPosts = {
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
