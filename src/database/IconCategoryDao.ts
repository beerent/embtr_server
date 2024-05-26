import { prisma } from '@database/prisma';

export class IconCategoryDao {
    public static async getByName(name: string) {
        return prisma.iconCategory.findFirst({
            where: {
                name,
            },
        });
    }

    public static async create(name: string) {
        return prisma.iconCategory.create({
            data: {
                name,
            },
        });
    }

    public static async getAll() {
        return prisma.iconCategory.findMany();
    }
}
