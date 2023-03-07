import { prisma } from '@database/prisma';
import { PlannedDay, PlannedTask, Task } from '@prisma/client';

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
            },
        });
    }

    public static deleteByUserIdAndPlannedDayIdAndTaskId(userId: number, plannedDayId: number, taskId: number) {
        return prisma.plannedTask.deleteMany({
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
