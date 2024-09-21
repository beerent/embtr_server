import { prisma } from '@database/prisma';
import { FeaturedPost } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';
import { UserIncludes } from './UserDao';

export class FeaturedPostDao {
    public static async getLatestUnexpired(currentDate: Date, type: Constants.FeaturedPostType) {
        return await prisma.featuredPost.findFirst({
            orderBy: {
                id: 'desc',
            },
            where: {
                OR: [
                    {
                        expirationDate: null,
                    },
                    {
                        expirationDate: {
                            gte: currentDate,
                        },
                    },
                ],
                type,
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

    public static async create(featuredPost: FeaturedPost) {
        return await prisma.featuredPost.create({
            data: {
                title: featuredPost.title,
                subtitle: featuredPost.subtitle,
                body: featuredPost.body,
                expirationDate: featuredPost.expirationDate,
                type: featuredPost.type,
            },
        });
    }
}
