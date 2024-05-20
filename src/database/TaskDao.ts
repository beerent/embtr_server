import { prisma } from '@database/prisma';
import { Prisma, Task } from '@prisma/client';
import { Task as TaskModel } from '@resources/schema';
import { logger } from '@src/common/logger/Logger';

export class TaskDao {
    public static async get(id: number, include?: Prisma.TaskInclude): Promise<Task | null> {
        const task = await prisma.task.findUnique({
            where: {
                id: id,
            },
            include: include,
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
        });

        return tasks;
    }

    public static async getByTitle(title: string): Promise<Task | null> {
        const task = await prisma.task.findFirst({
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
        });

        if (tasks) {
            return tasks;
        }

        return [];
    }

    public static async create(userId: number, task: TaskModel) {
        const result = prisma.task.create({
            data: {
                habitCategory: {
                    connect: {
                        id: 13,
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
                title: task.title ?? '',
                description: task.description,
                localImage: task.localImage,
                remoteImageUrl: task.remoteImageUrl,
                type: task.type,
            },
        });

        return result;
    }

    public static async deleteByTitle(title: string): Promise<void> {
        try {
            await prisma.task.deleteMany({
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
