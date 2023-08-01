import { prisma } from '@database/prisma';
import { Task } from '@prisma/client';
import { logger } from '@src/common/logger/Logger';

export class TaskController {
    public static async get(id: number): Promise<Task | null> {
        const task = await prisma.task.findUnique({
            where: {
                id: id,
            },
        });

        return task;
    }

    public static async getByIds(userId: number, ids: number[]): Promise<Task[]> {
        const tasks = await prisma.task.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            include: {
                taskPreference: {
                    include: {
                        habit: true,
                        unit: true,
                    },
                    where: {
                        userId: userId,
                        active: true,
                    },
                },
            },
        });

        return tasks;
    }

    public static async getByTitle(title: string): Promise<Task | null> {
        const task = await prisma.task.findUnique({
            where: {
                title: title,
            },
        });

        return task;
    }

    public static async getAllLikeTitle(userId: number, title: string): Promise<Task[]> {
        const tasks = await prisma.task.findMany({
            where: {
                title: {
                    startsWith: title,
                },
            },
            include: {
                taskPreference: {
                    include: {
                        habit: true,
                        unit: true,
                    },
                    where: {
                        userId: userId,
                        active: true,
                    },
                },
            },
        });

        if (tasks) {
            return tasks;
        }

        return [];
    }

    public static async create(
        title: string,
        description?: string,
        createdById?: number
    ): Promise<Task | null> {
        const result = await prisma.task.create({
            data: {
                title,
                description,
                createdById,
            },
        });

        return result;
    }

    public static async deleteByTitle(title: string): Promise<void> {
        try {
            await prisma.task.delete({
                where: {
                    title,
                },
            });
        } catch (error) {
            logger.error('attempted to delete object that doesnt exist', error);
        }
    }

    public static async deleteAllLikeTitle(title: string): Promise<void> {
        try {
            await prisma.task.deleteMany({
                where: {
                    title: {
                        startsWith: title,
                    },
                },
            });
        } catch (error) {
            logger.error('attempted to delete object that doesnt exist', error);
        }
    }
}
