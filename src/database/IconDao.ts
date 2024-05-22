import { prisma } from '@database/prisma';

export class IconDao {
    public static async getAllByCategory(category: string) {
        return prisma.icon.findMany({
            where: {
                categories: {
                    some: {
                        name: category,
                    },
                },
            },
        });
    }
}
