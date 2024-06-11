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

    public static async getAll() {
        return prisma.icon.findMany({
            include: {
                categories: true,
                tags: true
            }
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

    public static async update(iconId: number, icon: Partial<Icon>) {
        return prisma.icon.update({
            where: {
              id: iconId
            },
            data: {
                name: icon.name ?? '',
                remoteImageUrl: icon.remoteImageUrl
            },
        });
    }

    public static async delete(iconId: number) {
        return prisma.icon.delete({
            where: {
              id: iconId
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
