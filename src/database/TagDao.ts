import { prisma } from '@database/prisma';

export class TagDao {
    public static async getAll() {
        return prisma.tag.findMany();
    }


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
