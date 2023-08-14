import { prisma } from '@database/prisma';

export class TaskHabitPreferenceController {
    public static async update(userId: number, taskId: number, unitId?: number, quantity?: number) {
        const result = await prisma.taskPreference.upsert({
            where: {
                unique_user_task: {
                    userId: userId,
                    taskId: taskId,
                },
            },
            update: {
                unit: {
                    connect: unitId
                        ? {
                              id: unitId,
                          }
                        : undefined,
                },
                quantity: quantity,
            },
            create: {
                userId: userId,
                taskId: taskId,
                unitId: unitId,
                quantity,

                active: true,
            },
        });

        return result;
    }
}
