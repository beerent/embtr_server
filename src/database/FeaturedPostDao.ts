import { prisma } from '@database/prisma';
import { UserIncludes } from './UserDao';

export class FeaturedPostDao {
    public static async getLatestUnexpired(currentDate: Date) {
        return await prisma.featuredPost.findFirst({
            orderBy: {
                id: 'desc',
            },
            where: {
                expirationDate: {
                    gte: currentDate,
                },
            },
        });
    }

    public static async getLatest() {
        return await prisma.featuredPost.findFirst({
            orderBy: {
                id: 'desc',
            },
        });
    }

    public static async get(id: number) {
        return await prisma.featuredPost.findUnique({
            where: {
                id,
            },
            include: {
                comments: {
                    where: {
                        active: true,
                    },
                    include: {
                        user: {
                            include: UserIncludes,
                        },
                    },
                },

                likes: {
                    where: {
                        active: true,
                    },
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    public static async existsById(id: number) {
        return !!this.get(id);
    }
}
