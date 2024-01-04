import { prisma } from '@database/prisma';
import { ChallengeParticipant, ChallengeRequirementCompletionState } from '@resources/schema';

export class ChallengeParticipantDao {
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
                            OR: [
                                {
                                    task: {
                                        id: taskId,
                                    },
                                },
                            ],
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
                                unit: true,
                            },
                        },
                    },
                },
            },
        });
    }

    public static async getAllActiveForUser(userId: number) {
        return prisma.challengeParticipant.findMany({
            where: {
                userId,
                challenge: {
                    start: {
                        lte: new Date(),
                    },
                    end: {
                        gte: new Date(),
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
                                unit: true,
                            },
                        },
                    },
                },
            },
        });
    }

    public static async getAllForUser(
        userId: number,
        completionState?: ChallengeRequirementCompletionState
    ) {
        const completionCondition =
            completionState !== undefined
                ? { challengeRequirementCompletionState: completionState }
                : {};
        return prisma.challengeParticipant.findMany({
            where: {
                userId,
                ...completionCondition,
            },
            include: {
                challenge: {
                    include: {
                        challengeRewards: true,
                        challengeRequirements: {
                            include: {
                                task: true,
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
                completedOnPlannedDayId: participant.completedOnPlannedDayId,
                amountComplete: participant.amountComplete,
                challengeRequirementCompletionState:
                    participant.challengeRequirementCompletionState,
            },
        });
    }
}
