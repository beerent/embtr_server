import { prisma } from '@database/prisma';

export class TaskHabitPreferenceController {
    public static async update(userId: number, taskId: number, habitId: number) {
        const result = await prisma.taskHabitPreference.upsert({
            where: {
                unique_user_task: {
                    userId: userId,
                    taskId: taskId,
                },
            },
            update: {
                habitId: habitId,
            },
            create: {
                userId: userId,
                taskId: taskId,
                habitId: habitId,
            },
        });

        return result;
    }
}
