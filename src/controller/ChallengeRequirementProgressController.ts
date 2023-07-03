import { prisma } from '@database/prisma';
import { ChallengeRequirementProgress } from '@resources/schema';

export class ChallengeRequirementProgressController {
    public static async getAllForRequirementsAndParticipant(
        requirementId: number[],
        participantId: number
    ) {
        return prisma.challengeRequirementProgress.findMany({
            where: {
                active: true,
                challengeRequirementId: {
                    in: requirementId,
                },
                challengeParticipantId: participantId,
            },
            include: {
                challengeRequirement: {
                    include: {
                        task: true,
                        habit: true,
                        unit: true,
                    },
                },
                challengeParticipant: true,
            },
        });
    }

    public static async getAllForUserAndTaskAndDate(userId: number, taskId: number, date: Date) {
        return prisma.challengeRequirementProgress.findMany({
            where: {
                active: true,
                challengeRequirement: {
                    task: {
                        id: taskId,
                    },
                    challenge: {
                        start: {
                            lte: date,
                        },
                        end: {
                            gte: date,
                        },
                    },
                },
                challengeParticipant: {
                    userId,
                },
            },
            include: {
                challengeRequirement: {
                    include: {
                        task: true,
                        habit: true,
                        unit: true,
                    },
                },
                challengeParticipant: true,
            },
        });
    }

    public static async getAll() {
        return prisma.challenge.findMany({
            include: {
                challengeRequirements: {
                    include: {
                        task: true,
                        habit: true,
                        unit: true,
                    },
                },
                challengeRewards: true,
                challengeParticipants: true,
                creator: true,
                likes: true,
                comments: true,
            },
        });
    }

    public static async create(
        userId: number,
        challengeId: number,
        challengeRequirementProgess: ChallengeRequirementProgress
    ) {
        const result = await prisma.challengeRequirementProgress.create({
            data: {
                challengeParticipant: {
                    connect: {
                        unique_challenge_participant: {
                            userId,
                            challengeId,
                        },
                    },
                },
                challengeRequirement: {
                    connect: {
                        id: challengeRequirementProgess.challengeRequirementId,
                    },
                },
                amountComplete: challengeRequirementProgess.amountComplete!,
                amountRequired: challengeRequirementProgess.amountRequired!,
                percentComplete: challengeRequirementProgess.percentComplete!,
                challengeRequirementCompletionState:
                    challengeRequirementProgess.challengeRequirementCompletionState,
            },
        });

        return result;
    }
}
