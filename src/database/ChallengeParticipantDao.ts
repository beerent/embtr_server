import { prisma } from '@database/prisma';
import { ChallengeParticipant, ChallengeRequirementCompletionState } from '@resources/schema';

export class ChallengeParticipantDao {
    public static async getForUserAndChallenge(userId: number, challengeId: number) {
        return prisma.challengeParticipant.findUnique({
            where: {
                unique_challenge_participant: {
                    userId,
                    challengeId,
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
                active: true,
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

    public static async getAllByIds(ids: number[]) {
        return prisma.challengeParticipant.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            include: {
                user: true,
            },
        });
    }

    public static async update(participant: ChallengeParticipant) {
        const active = participant.active !== undefined ? { active: participant.active } : {};

        return prisma.challengeParticipant.update({
            where: {
                id: participant.id,
            },
            data: {
                completedOnPlannedDayId: participant.completedOnPlannedDayId,
                amountComplete: participant.amountComplete,
                challengeRequirementCompletionState:
                    participant.challengeRequirementCompletionState,
                ...active,
            },
        });
    }

    public static async archive(id: number) {
        return prisma.challengeParticipant.update({
            where: {
                id: id,
            },
            data: {
                active: false,
            },
        });
    }
}
