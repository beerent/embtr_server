import { prisma } from '@database/prisma';

export class UserPropertyDao {
    public static async getByKey(userId: number, key: string) {
        return prisma.property.findUnique({
            where: {
                userId_key: {
                    userId,
                    key,
                },
            },
        });
    }

    public static async getAll(userId: number) {
        return prisma.property.findMany({
            where: {
                userId,
            },
        });
    }

    public static async getAllByKey(key: string) {
        return prisma.property.findMany({
            where: {
                key,
            },
        });
    }

    public static async set(userId: number, key: string, value: string) {
        return prisma.property.upsert({
            where: {
                userId_key: {
                    userId,
                    key,
                },
            },
            update: {
                value,
            },
            create: {
                userId,
                key,
                value,
            },
        });
    }
}
