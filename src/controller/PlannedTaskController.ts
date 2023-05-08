import { prisma } from '@database/prisma';
import { PlannedDay, PlannedTask, Task, Habit } from '@prisma/client';
import { PlannedTask as PlannedTaskModel } from '@resources/schema';

export type PlannedTaskFull = PlannedTask & { task: Task; plannedDay: PlannedDay };

export class PlannedTaskController {
    public static async create(
        plannedDay: PlannedDay,
        task: Task,
        habit?: Habit
    ): Promise<PlannedTask | null> {
        const data = {
            plannedDay: {
                connect: {
                    id: plannedDay.id,
                },
            },
            task: {
                connect: {
                    id: task.id,
                },
            },
            habit: {},
            status: 'INCOMPLETE',
            count: 1,
        };

        if (habit !== undefined) {
            data.habit = {
                connect: {
                    id: habit.id,
                },
            };
        }

        return await prisma.plannedTask.upsert({
            create: data,
            update: {
                count: { increment: 1 },
            },
            where: {
                unique_planned_day_task: {
                    plannedDayId: plannedDay.id,
                    taskId: task.id,
                },
            },
        });
    }

    public static async update(plannedTask: PlannedTaskModel): Promise<PlannedTaskFull> {
        const status = plannedTask.status !== undefined ? { status: plannedTask.status } : {};
        const count = plannedTask.count !== undefined ? { count: plannedTask.count } : {};
        const completedCount =
            plannedTask.completedCount !== undefined
                ? { completedCount: plannedTask.completedCount }
                : {};

        const result = await prisma.plannedTask.update({
            where: {
                id: plannedTask.id,
            },
            data: {
                ...status,
                ...count,
                ...completedCount,
            },
            include: {
                task: true,
                plannedDay: true,
            },
        });

        return result;
    }

    public static async get(id: number): Promise<PlannedTaskFull | null> {
        return await prisma.plannedTask.findUnique({
            where: {
                id,
            },
            include: {
                task: true,
                plannedDay: true,
            },
        });
    }

    public static async getByPlannedDayIdAndTaskId(plannedDayId: number, taskId: number) {
        return await prisma.plannedTask.findUnique({
            where: {
                unique_planned_day_task: {
                    plannedDayId,
                    taskId,
                },
            },
            include: {
                task: true,
                plannedDay: true,
            },
        });
    }

    public static async deleteByUserIdAndPlannedDayIdAndTaskId(
        userId: number,
        plannedDayId: number,
        taskId: number
    ) {
        return await prisma.plannedTask.deleteMany({
            where: {
                plannedDay: {
                    userId,
                    id: plannedDayId,
                },
                taskId,
            },
        });
    }

    public static async getRecent(userId: number, limit: number) {
        const result = await prisma.plannedTask.groupBy({
            by: ['taskId', 'createdAt'],
            where: {
                plannedDay: {
                    userId,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return result;
    }
}
