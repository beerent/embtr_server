import { prisma } from '@database/prisma';
import { UserAward } from '@resources/schema';

export class UserAwardDao {
    public static async get(userId: number, awardId: number) {
        return await prisma.userAward.findUnique({
            where: {
                unique_user_award: {
                    userId,
                    awardId,
                },
            },
        });
    }

    public static async create(userId: number, awardId: number) {
        return await prisma.userAward.create({
            data: {
                userId,
                awardId,
            },
        });
    }

    public static async update(userAward: UserAward) {
        return await prisma.userAward.update({
            where: {
                unique_user_award: {
                    userId: userAward.userId || 0,
                    awardId: userAward.awardId || 0,
                },
            },
            data: {
                active: userAward.active === true,
            },
        });
    }
}
