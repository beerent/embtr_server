import { prisma } from '@database/prisma';
import { Icon } from '@resources/schema';

export class IconDao {
    public static async get(id: number) {
        return prisma.icon.findUnique({
            where: {
                id,
            },
        });
    }

    public static async getAllByCategory(category: string) {
        return prisma.icon.findMany({
            where: {
                categories: {
                    some: {
                        name: category,
                    },
                },
            },
            include: {
                categories: true,
                tags: true,
            },
        });
    }

    public static async create(icon: Icon) {
        return prisma.icon.create({
            data: {
                name: icon.name ?? '',
                key: icon.key ?? '',
                remoteImageUrl: icon.remoteImageUrl,
                localImage: icon.localImage,
            },
        });
    }

    public static async addTags(iconId: number, tagIds: number[]) {
        return prisma.icon.update({
            where: {
                id: iconId,
            },
            data: {
                tags: {
                    connect: tagIds.map((id) => ({
                        id,
                    })),
                },
            },
        });
    }

    public static async addCategories(iconId: number, categoryIds: number[]) {
        return prisma.icon.update({
            where: {
                id: iconId,
            },
            data: {
                categories: {
                    connect: categoryIds.map((id) => ({
                        id,
                    })),
                },
            },
        });
    }
}
