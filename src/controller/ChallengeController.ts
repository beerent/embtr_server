import { prisma } from '@database/prisma';

export class ChallengeController {
    public static async get(id: number) {
        return prisma.challenge.findUnique({
            where: {
                id,
            },
            include: {
                challengeRequirements: {
                    include: {
                        task: true,
                        habit: true,
                    },
                },
                challengeParticipants: true,
                creator: true,
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
                    },
                },
                challengeParticipants: true,
                creator: true,
            },
        });
    }

    public static async getAllForUser(userId: number) {
        return prisma.challenge.findMany({
            where: {
                challengeParticipants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                challengeRequirements: {
                    include: {
                        task: true,
                        habit: true,
                    },
                },
                challengeParticipants: true,
                creator: true,
            },
        });
    }

    public static async register(userId: number, challengeId: number) {
        const result = await prisma.challengeParticipant.create({
            data: {
                userId,
                challengeId,
            },
        });

        return result;
    }
}
