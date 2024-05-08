import { prisma } from '@database/prisma';

export class AwardDao {
    public static async get(id: number) {
        return prisma.award.findUnique({
            where: {
                id,
            },
        });
    }
}
