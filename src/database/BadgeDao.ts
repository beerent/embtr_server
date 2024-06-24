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

    public static async create(badge: Badge) {
        return prisma.badge.create({
            data: {
                category: badge.category ?? '',
                key: badge.key ?? '',
                icon: {
                    connect: { 
                        id: badge.iconId
                    }
                }
            }
        });
    }

    public static async update(badgeId: number, badge: Badge) {
        return prisma.badge.update({
            where: {
                id: badgeId
            },
            data: {
                category: badge.category ?? '',
                key: badge.key ?? '',
                icon: {
                    connect: { 
                        id: badge.iconId
                    }
                }
            }
        });
    }

    public static async delete(badgeId: number) {
        return prisma.badge.delete({
            where: {
                id: badgeId
            }
        })
    }
}
