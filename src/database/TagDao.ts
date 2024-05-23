import { prisma } from '@database/prisma';
import { Icon } from '@resources/schema';

export class TagDao {
    public static async getByName(name: string) {
        return prisma.tag.findFirst({
            where: {
                name,
            },
        });
    }

    public static async create(name: string) {
        return prisma.tag.create({
            data: {
                name,
            },
        });
    }
}
