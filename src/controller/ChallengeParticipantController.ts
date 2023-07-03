import { prisma } from '@database/prisma';
import { ChallengeParticipant } from '@resources/schema';

export class ChallengeParticipantController {
    public static async getAllForUserAndTaskAndDate(userId: number, taskId: number, date: Date) {
        return prisma.challengeParticipant.findMany({
            where: {
                active: true,
                userId,
                challenge: {
                    start: {
                        lte: date,
                    },
                    end: {
                        gte: date,
                    },
                    challengeRequirements: {
                        some: {
                            task: {
                                id: taskId,
                            },
                        },
                    },
                },
            },

            include: {
                challenge: {
                    include: {
                        challengeRewards: true,
                        challengeRequirements: {
                            include: {
                                task: true,
                                habit: true,
                                unit: true,
                            },
                        },
                    },
                },
            },
        });
    }

    public static async getAllForUser(userId: number) {
        return prisma.challengeParticipant.findMany({
            where: {
                userId,
            },
            include: {
                challenge: {
                    include: {
                        challengeRewards: true,
                        challengeRequirements: {
                            include: {
                                task: true,
                                habit: true,
                                unit: true,
                            },
                        },
                    },
                },
            },
        });
    }

    public static async update(participant: ChallengeParticipant) {
        return prisma.challengeParticipant.update({
            where: {
                id: participant.id,
            },
            data: {
                amountComplete: participant.amountComplete,
                challengeRequirementCompletionState:
                    participant.challengeRequirementCompletionState,
            },
        });
    }
}
