import { prisma } from '@database/prisma';

export class HabitCategoryController {
    public static async getAll(userId: number) {
        return await prisma.habitCategory.findMany({
            where: {
                active: true,
            },
            include: {
                tasks: {
                    where: {
                        userId: userId,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });
    }
}
