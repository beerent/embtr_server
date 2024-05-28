import { prisma } from '@database/prisma';
import { Award } from '@resources/schema';

export class AwardDao {
    public static async get(id: number) {
        return prisma.award.findUnique({
            where: {
                id,
            },
        });
    }

    public static async create(award: Award) {
        return prisma.award.create({
            data: {
                name: award.name ?? '',
                description: award.description,
                icon: {
                    connect: {
                        id: award.iconId,
                    },
                },
            },
        });
    }
}
