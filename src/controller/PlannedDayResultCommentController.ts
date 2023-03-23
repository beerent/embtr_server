import { prisma } from '@database/prisma';

export class PlannedDayResultCommentController {
    public static async get(id: number) {
        const result = await prisma.plannedDayResultComment.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });

        return result;
    }

    public static async create(comment: string, userId: number, plannedDayResultId: number) {
        return await prisma.plannedDayResultComment.create({
            data: {
                comment,
                user: {
                    connect: {
                        id: userId,
                    },
                },
                plannedDayResult: {
                    connect: {
                        id: plannedDayResultId,
                    },
                },
            },
        });
    }

    public static async delete(id: number) {
        return await prisma.plannedDayResultComment.update({
            where: {
                id,
            },
            data: {
                active: false,
            },
        });
    }
}
