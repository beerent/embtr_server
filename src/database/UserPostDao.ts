import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { UserPost } from '@resources/schema';
import { CommonUpserts } from './CommonUpserts';

export const UserPostInclude = {
    comments: {
        where: {
            active: true,
        },
        include: {
            user: true,
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
    images: {
        where: {
            active: true,
        },
        include: {
            plannedDayResults: true,
        },
    },
    user: true,
} satisfies Prisma.UserPostInclude;

export class UserPostDao {
    public static async getAllForUser(userId: number) {
        return await prisma.userPost.findMany({
            where: {
                user: {
                    id: userId,
                },
                active: true,
            },
            include: UserPostInclude,
        });
    }

    public static async getAllInIds(ids: number[]) {
        return prisma.userPost.findMany({
            where: {
                id: {
                    in: ids,
                },
                active: true,
            },
            include: UserPostInclude,
        });
    }

    public static async getAllByBounds(upperBound: Date, lowerBound: Date) {
        return await prisma.userPost.findMany({
            where: {
                active: true,
                createdAt: {
                    lte: upperBound,
                    gte: lowerBound,
                },
            },
            include: UserPostInclude,
        });
    }

    public static async getById(id: number) {
        return await prisma.userPost.findUnique({
            where: {
                id: id,
            },
            include: UserPostInclude,
        });
    }

    public static async existsById(id: number) {
        return (await this.getById(id)) !== null;
    }

    public static async create(userPost: UserPost) {
        const title = userPost.title ? { title: userPost.title } : {};
        const body = userPost.body ? { body: userPost.body } : {};
        const active = userPost.active ? { active: userPost.active } : {};
        const images = CommonUpserts.createImagesInserts(userPost.images ?? []);
        const likes = CommonUpserts.createLikesInserts(userPost.likes ?? []);
        const comments = CommonUpserts.createCommentsInserts(userPost.comments ?? []);

        const result = await prisma.userPost.create({
            data: {
                user: {
                    connect: {
                        id: userPost.userId!,
                    },
                },
                ...title,
                ...body,
                ...active,
                images,
                likes,
                comments,
            },
            include: UserPostInclude,
        });

        return result;
    }

    public static async update(userPost: UserPost) {
        const title = userPost.title ? { title: userPost.title } : {};
        const body = userPost.body ? { body: userPost.body } : {};
        const active = userPost.active !== undefined ? { active: userPost.active } : {};
        const images = CommonUpserts.createImagesUpserts(userPost.images ?? []);
        const likes = CommonUpserts.createLikesUpserts(userPost.likes ?? []);
        const comments = CommonUpserts.createCommentsUpserts(userPost.comments ?? []);

        const result = await prisma.userPost.update({
            where: { id: userPost.id },
            data: {
                ...title,
                ...body,
                ...active,
                images,
                likes,
                comments,
            },
            include: UserPostInclude,
        });

        return result;
    }
}
