import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export type HabitCategoryPrisma = Prisma.PromiseReturnType<
    typeof HabitCategoryController.getGenericHabits
>;

export class HabitCategoryController {
    public static async getGenericHabits() {
        return prisma.habitCategory.findMany({
            where: {
                active: true,
                generic: true,
            },
            include: {
                tasks: true,
            },
        });
    }

    public static async getById(id: number) {
        return prisma.habitCategory.findFirst({
            where: {
                id: id,
            },
            include: {
                tasks: true,
            },
        });
    }

    public static async getByName(name: string) {
        return prisma.habitCategory.findFirst({
            where: {
                name: name,
            },
            include: {
                tasks: true,
            },
        });
    }

    public static async getCustomHabits(userId: number) {
        return prisma.habitCategory.findMany({
            where: {
                active: true,
                name: 'Custom Habits',
            },
            include: {
                tasks: {
                    where: {
                        userId: userId,
                    },
                },
            },
        });
    }
}
