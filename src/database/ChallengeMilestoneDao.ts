import { prisma } from '@database/prisma';

export class ChallengeMilestoneDao {
    public static async create(challengeId: number, milestoneKey: string) {
        return prisma.challengeMilestone.create({
            data: {
                challenge: {
                    connect: {
                        id: challengeId,
                    },
                },
                milestone: {
                    connect: {
                        key: milestoneKey,
                    },
                },
            },
        });
    }

    public static async removeAllForChallenge(challengeId: number) {
        return prisma.challengeMilestone.deleteMany({
            where: {
                challengeId,
            },
        });
    }
}
