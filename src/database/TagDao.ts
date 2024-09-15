import { prisma } from '@database/prisma';
import { Constants } from '@resources/types/constants/constants';

export class TagDao {
    public static async getAll() {
        return prisma.tag.findMany();
    }

    public static async getAllByCategory(category: Constants.TagCategory) {
        return prisma.tag.findMany({
            where: {
                category,
            },
        });
    }

    public static async getByCategoryAndName(category: Constants.TagCategory, name: string) {
        return prisma.tag.findFirst({
            where: {
                name,
                category,
            },
        });
    }

    public static async create(category: Constants.TagCategory, name: string) {
        return prisma.tag.create({
            data: {
                name,
                category,
            },
        });
    }
}
