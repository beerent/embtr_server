import { prisma } from '@database/prisma';
import { UserFeaturedPost } from '@resources/schema';

export class UserFeaturedPostDao {
    public static async update(userFeaturedPost: UserFeaturedPost) {
        return await prisma.userFeaturedPost.update({
            where: {
                id: userFeaturedPost.id,
            },
            data: {
                sortDate: userFeaturedPost.sortDate,
                isViewed: userFeaturedPost.isViewed,
            },
        });
    }

    public static async get(id: number) {
        return await prisma.userFeaturedPost.findUnique({
            where: {
                id,
            },
        });
    }

    public static async getAllByIds(userId: number, ids: number[]) {
        return await prisma.userFeaturedPost.findMany({
            where: {
                userId,
                id: {
                    in: ids,
                },
            },
            include: {
                featuredPost: {
                    select: {
                        id: true,
                        title: true,
                        subtitle: true,
                        body: true,
                        images: true,
                        likes: true,
                        comments: {
                            where: {
                                active: true,
                            },
                        },
                        createdAt: true,
                    },
                },
            },
        });
    }

    public static async getAllForUser(userId: number) {
        return await prisma.userFeaturedPost.findMany({
            where: {
                userId,
            },
        });
    }

    public static async createIfNotExists(userId: number, featuredPostId: number, sortDate: Date) {
        return await prisma.userFeaturedPost.upsert({
            where: {
                unique_user_featured_post: {
                    userId,
                    featuredPostId,
                },
            },
            create: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                featuredPost: {
                    connect: {
                        id: featuredPostId,
                    },
                },
                sortDate,
            },
            update: {},
        });
    }

    public static async getByUserIdAndFeaturedPostId(userId: number, featuredPostId: number) {
        return await prisma.userFeaturedPost.findUnique({
            where: {
                unique_user_featured_post: {
                    userId,
                    featuredPostId,
                },
            },
        });
    }
}
