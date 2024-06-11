import { prisma } from '@database/prisma';
import { ChallengeRequirement } from '@resources/schema';

export class ChallengeRequirementDao {
    public static async create(challengeRequirement: ChallengeRequirement) {
        return prisma.challengeRequirement.create({
            data: {
                task: {
                    connect: {
                        id: challengeRequirement.taskId,
                    },
                },
                challenge: {
                    connect: {
                        id: challengeRequirement.challengeId,
                    },
                },
                unit: {
                    connect: {
                        id: challengeRequirement.unitId,
                    },
                },
                calculationType: challengeRequirement.calculationType,
                calculationIntervalDays: challengeRequirement.calculationIntervalDays,
                requiredIntervalQuantity: challengeRequirement.requiredIntervalQuantity,
                requiredTaskQuantity: challengeRequirement.requiredTaskQuantity,
            },
        });
    }

    public static async update(challengeRequirement: ChallengeRequirement) {
        return prisma.challengeRequirement.update({
            where: {
                id: challengeRequirement.id,
            },
            data: {
                task: {
                    connect: {
                        id: challengeRequirement.taskId,
                    },
                },
                challenge: {
                    connect: {
                        id: challengeRequirement.challengeId,
                    },
                },
                unit: {
                    connect: {
                        id: challengeRequirement.unitId,
                    },
                },
                calculationType: challengeRequirement.calculationType,
                calculationIntervalDays: challengeRequirement.calculationIntervalDays,
                requiredIntervalQuantity: challengeRequirement.requiredIntervalQuantity,
                requiredTaskQuantity: challengeRequirement.requiredTaskQuantity,
            },
        });
    }

    public static async getAllForUserAndTaskAndDate(userId: number, taskId: number, date: Date) {
        return prisma.challengeRequirement.findMany({
            where: {
                active: true,
                task: {
                    id: taskId,
                },
                challenge: {
                    challengeParticipants: {
                        some: {
                            userId,
                        },
                    },
                    start: {
                        lte: date,
                    },
                    end: {
                        gte: date,
                    },
                },
            },
            include: {
                challenge: true,
            },
        });
    }
}
