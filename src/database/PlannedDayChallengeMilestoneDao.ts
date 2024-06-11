import { prisma } from '@database/prisma';

export class PlannedDayChallengeMilestoneDao {
    public static deleteAll(ids: number[]) {
        return prisma.plannedDayChallengeMilestone.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
    }

    public static async create(
        plannedDayId: number,
        challengeMilestoneId: number,
        challengeParticipantId: number
    ) {
        return prisma.plannedDayChallengeMilestone.create({
            data: {
                plannedDayId,
                challengeMilestoneId,
                challengeParticipantId,
            },
        });
    }

    public static async getAllForChallengeParticipantWithChallengeMilestoneInList(
        challengeParticipantId: number,
        ids: number[]
    ) {
        return prisma.plannedDayChallengeMilestone.findMany({
            where: {
                challengeParticipantId,
                challengeMilestoneId: {
                    in: ids,
                },
            },
        });
    }

    public static async deleteAllForChallengeParticipantWithChallengeMilestoneInList(
        challengeParticipantId: number,
        challengeMilestoneIds: number[]
    ) {
        return prisma.plannedDayChallengeMilestone.deleteMany({
            where: {
                challengeParticipantId,
                challengeMilestone: {
                    id: {
                        in: challengeMilestoneIds,
                    },
                },
            },
        });
    }

    public static async deleteAllByChallenge(challengeId: number) {
        return prisma.plannedDayChallengeMilestone.deleteMany({
            where: {
                challengeParticipant: {
                    challenge: {
                        id: challengeId,
                    },
                },
            },
        });
    }
}
