import { prisma } from '@database/prisma';
import { Badge } from '@resources/schema';

export class BadgeDao {
    public static async get(key: string) {
        return prisma.badge.findUnique({
            where: {
                key,
            },
        });
    }

    public static async getAll() {
        return prisma.badge.findMany({
            include: {
                icon: true
            }
        });
    }

    public static async getAllByCategory(category: string) {
        return prisma.badge.findMany({
            where: {
                category,
            },
        });
    }

    public static async create(data: Badge) {
        return prisma.badge.create({
            data: {
                category: data.category ?? '',
                key: data.key ?? '',
                icon: {
                    connect: {
                        id: data.iconId
                    }
                }
            }
        });
    }
}
