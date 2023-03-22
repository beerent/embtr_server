import { prisma } from '@database/prisma';
import { PlannedDay, PlannedTask, Task } from '@prisma/client';
import { PlannedTask as PlannedTaskModel } from '@resources/schema';

export type PlannedTaskFull = PlannedTask & { task: Task; plannedDay: PlannedDay };

export class PlannedTaskController {
    public static async create(plannedDay: PlannedDay, task: Task): Promise<PlannedTask | null> {
        return await prisma.plannedTask.create({
            data: {
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
                status: 'INCOMPLETE',
                active: true,
            },
        });
    }

    public static async update(plannedTask: PlannedTaskModel): Promise<PlannedTaskFull> {
        const status = plannedTask.status !== undefined ? { status: plannedTask.status } : {};
        const active = plannedTask.active !== undefined ? { active: plannedTask.active } : {};

        const result = await prisma.plannedTask.update({
            where: {
                id: plannedTask.id,
            },
            data: {
                ...status,
                ...active,
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

    public static async deleteByUserIdAndPlannedDayIdAndTaskId(userId: number, plannedDayId: number, taskId: number) {
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
}
