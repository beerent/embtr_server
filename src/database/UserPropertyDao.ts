import { prisma } from '@database/prisma';

export interface ValueCountMap {
    [value: string]: number;
}

export class UserPropertyDao {
    public static async countByDistinctValueForKey(key: string): Promise<ValueCountMap> {
        const result = await prisma.property.groupBy({
            by: ['value'],
            where: {
                key,
            },
            _count: {
                value: true,
            },
        });

        const valueCountMap: ValueCountMap = {};
        result.forEach((row) => {
            valueCountMap[row.value] = row._count.value;
        });

        return valueCountMap;
    }

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
