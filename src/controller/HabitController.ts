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

    public static async create(name: string) {
        const habit = await prisma.habit.create({
            data: { title: name },
        });

        return habit;
    }

    public static async deleteById(id: number) {
        const habit = await prisma.habit.deleteMany({
            where: { id },
        });

        return habit;
    }

    public static async deleteByTitle(title: string) {
        const habit = await prisma.habit.deleteMany({
            where: { title },
        });

        return habit;
    }
}
