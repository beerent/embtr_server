import { prisma } from '@database/prisma';

export class TaskHabitPreferenceController {
    public static async update(
        userId: number,
        taskId: number,
        habitId?: number,
        unitId?: number,
        quantity?: number
    ) {
        const result = await prisma.taskPreference.upsert({
            where: {
                unique_user_task: {
                    userId: userId,
                    taskId: taskId,
                },
            },
            update: {
                habit: habitId
                    ? {
                          connect: {
                              id: habitId,
                          },
                      }
                    : undefined,
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
                habitId: habitId,
                unitId: unitId,
                quantity,

                active: true,
            },
        });

        return result;
    }
}
