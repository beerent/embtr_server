import { prisma } from '@database/prisma';
import { HabitStreak } from '@resources/schema';

export class HabitStreakDao {
    public static async get(id: number) {
        return await prisma.habitStreak.findUnique({
            where: {
                id,
            },
        });
    }

    public static async getByDetails(userId: number, type: string, habitId?: number) {
        return await prisma.habitStreak.findUnique({
            where: {
                unique_user_task_type: {
                    userId,
                    taskId: habitId ?? 0,
                    type,
                },
            },
        });
    }

    public static async upsert(habitStreak: HabitStreak) {
        return await prisma.habitStreak.upsert({
            where: {
                unique_user_task_type: {
                    userId: habitStreak.userId ?? 0,
                    taskId: habitStreak.taskId ?? 0,
                    type: habitStreak.type ?? 'INVALID',
                },
            },
            update: {
                streak: habitStreak.streak,
            },
            create: {
                userId: habitStreak.userId ?? 0,
                taskId: habitStreak.taskId ?? 0,
                streak: habitStreak.streak ?? 0,
                type: habitStreak.type ?? 'INVALID',
            },
        });
    }
}
