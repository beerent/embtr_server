import { prisma } from '@database/prisma';

export class TaskHabitPreferenceController {
    public static async update(userId: number, taskId: number, updatedHabitId: number) {
        const habitId = updatedHabitId !== undefined ? { habitId: updatedHabitId } : {};

        const result = await prisma.taskHabitPreference.upsert({
            where: {
                unique_user_task: {
                    userId: userId,
                    taskId: taskId,
                },
            },
            update: {
                ...habitId,
                active: updatedHabitId !== undefined,
            },
            create: {
                userId: userId,
                taskId: taskId,
                habitId: updatedHabitId ?? 0,
                active: true,
            },
        });

        return result;
    }
}
