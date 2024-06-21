import { prisma } from '@database/prisma';

export class BadgeDao {
    public static async get(key: string) {
        return prisma.badge.findUnique({
            where: {
                key,
            },
        });
    }

    public static async getAllByCategory(category: string) {
        return prisma.badge.findMany({
            where: {
                category,
            },
        });
    }
}
