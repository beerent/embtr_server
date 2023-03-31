import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

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
} satisfies Prisma.UserPostInclude;

export class UserPostController {
    public static async getById(id: number) {
        return await prisma.userPost.findUnique({
            where: {
                id: id,
            },
            include: UserPostInclude,
        });
    }
}
