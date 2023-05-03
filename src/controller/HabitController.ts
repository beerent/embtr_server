import { prisma } from '@database/prisma';

export class HabitController {
    public static async getAll() {
        const allHabits = await prisma.habit.findMany();
        return allHabits;
    }

    public static async get(id: number) {
        const habit = await prisma.habit.findUnique({
            where: { id },
        });

        return habit;
    }
}
