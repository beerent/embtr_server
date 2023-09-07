import { prisma } from '@database/prisma';

export class HabitCategoryController {
    public static async getAll() {
        return await prisma.habitCategory.findMany({
            where: {
                active: true,
            },
        });
    }
}
