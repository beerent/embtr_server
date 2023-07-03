import { prisma } from '@database/prisma';

export class ChallengeRequirementController {
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
