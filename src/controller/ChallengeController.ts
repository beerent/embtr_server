import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export interface ChallengeRequirementResults {
    intervalIndex: number;
    intervalStartDate: Date;
    totalCompleted: number;
}

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
                        unit: true,
                    },
                },
                challengeRewards: true,
                challengeParticipants: true,
                creator: true,
                likes: {
                    include: {
                        user: true,
                    },
                },
                comments: {
                    where: {
                        active: true,
                    },
                    include: {
                        user: true,
                    },
                },
            },
        });
    }

    public static async existsById(id: number) {
        const result = await this.get(id);
        return !!result;
    }

    public static async getAll() {
        return prisma.challenge.findMany({
            include: {
                challengeRequirements: {
                    include: {
                        task: true,
                        unit: true,
                    },
                },
                challengeRewards: true,
                challengeParticipants: true,
                creator: true,
                likes: true,
                comments: {
                    where: {
                        active: true,
                    },
                },
            },
        });
    }

    public static async getAllRecentJoins(upperBound: Date, lowerBound: Date) {
        return prisma.challenge.findMany({
            where: {
                challengeParticipants: {
                    some: {
                        active: true,
                        createdAt: {
                            gte: lowerBound,
                            lte: upperBound,
                        },
                    },
                },
            },
            include: {
                likes: true,
                comments: {
                    where: {
                        active: true,
                    },
                },
                creator: true,
                challengeParticipants: {
                    where: {
                        active: true,
                    },
                    include: {
                        user: true,
                    },
                },
                challengeRewards: true,
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

    public static async register(userId: number, challengeId: number) {
        const result = await prisma.challengeParticipant.create({
            data: {
                userId,
                challengeId,
            },
        });

        return result;
    }

    public static async getChallengeRequirementProgess(
        startDate: Date,
        endDate: Date,
        userId: number,
        interval: number,
        taskId?: number
    ) {
        if (taskId) {
            return this.getTaskBasedChallengeRequirementProgess(
                startDate,
                endDate,
                userId,
                interval,
                taskId
            );
        }

        return [];
    }

    private static async getTaskBasedChallengeRequirementProgess(
        startDate: Date,
        endDate: Date,
        userId: number,
        interval: number,
        taskId: number
    ) {
        const startDateString = startDate.toISOString().replace('T', ' ').replace('Z', '');
        const endDateString = endDate.toISOString().replace('T', ' ').replace('Z', '');

        const result: ChallengeRequirementResults[] = await prisma.$queryRaw(
            Prisma.sql`
            SELECT floor((DATEDIFF(planned_day.date, '1971-01-01') - DATEDIFF(${startDateString}, '1971-01-01')) / ${interval}) AS intervalIndex,
            MIN(planned_day.date)                                                                 AS intervalStartDate,
            SUM(completedQuantity)                                                                AS totalCompleted
     FROM planned_task
              JOIN planned_day ON plannedDayId = planned_day.id
     WHERE userId = ${userId}
       AND taskId = ${taskId}
       AND planned_task.active = true
       AND planned_day.date >= ${startDateString}
       AND planned_day.date < ${endDateString}
     group by intervalIndex; 
            `
        );

        return result;
    }

    private static async getHabitBasedChallengeRequirementProgess(
        startDate: Date,
        endDate: Date,
        userId: number,
        interval: number
    ) {
        const startDateString = startDate.toISOString().replace('T', ' ').replace('Z', '');
        const endDateString = endDate.toISOString().replace('T', ' ').replace('Z', '');

        const result: ChallengeRequirementResults[] = await prisma.$queryRaw(
            Prisma.sql`
            SELECT floor((DATEDIFF(planned_day.date, '1971-01-01') - DATEDIFF(${startDateString}, '1971-01-01')) / ${interval}) AS intervalIndex,
            MIN(planned_day.date)                                                                 AS intervalStartDate,
            SUM(completedQuantity)                                                                AS totalCompleted
     FROM planned_task
              JOIN planned_day ON plannedDayId = planned_day.id
     WHERE userId = ${userId}
       AND planned_task.active = true
       AND planned_day.date >= ${startDateString}
       AND planned_day.date < ${endDateString}
     group by intervalIndex; 
            `
        );

        return result;
    }
}
