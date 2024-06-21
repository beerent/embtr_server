import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { Challenge } from '@resources/schema';
import { UserPropertyUtility } from '@src/utility/UserPropertyUtility';
import { UserIncludes } from './UserDao';

export interface ChallengeRequirementResults {
    intervalIndex: number;
    intervalStartDate: Date;
    totalCompleted: number;
}

export class ChallengeDao {
    public static async create(challenge: Challenge) {
        return prisma.challenge.create({
            data: {
                name: challenge.name ?? '',
                description: challenge.description ?? '',
                start: challenge.start ?? new Date(),
                end: challenge.end ?? new Date(),
                award: {
                    connect: {
                        id: challenge.awardId,
                    },
                },
                creator: {
                    connect: {
                        id: challenge.creatorId,
                    },
                },
            },
        });
    }

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
                challengeParticipants: true,
                challengeMilestones: { include: { milestone: true } },
                award: { include: { icon: true } },
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
                        user: {
                            include: UserIncludes,
                        },
                    },
                },
            },
        });
    }

    public static async getAllWhereEndDateGreaterThan(date: Date) {
        return prisma.challenge.findMany({
            where: {
                end: {
                    gte: date,
                },
            },
            include: {
                challengeRequirements: {
                    include: {
                        task: true,
                        unit: true,
                    },
                },
                challengeParticipants: true,
                award: {
                    include: {
                        icon: true,
                    },
                },
                creator: true,
                likes: {
                    where: {
                        active: true,
                    },
                },
                comments: {
                    where: {
                        active: true,
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
                challengeParticipants: true,
                award: { include: { icon: true } },
                creator: true,
                likes: {
                    where: {
                        active: true,
                    },
                },
                comments: {
                    where: {
                        active: true,
                    },
                },
            },
        });
    }

    public static async getAllByIds(ids: number[]) {
        return prisma.challenge.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            include: {
                challengeRequirements: {
                    include: {
                        task: true,
                        unit: true,
                    },
                },
                challengeParticipants: {
                    include: {
                        user: {
                            include: UserIncludes,
                        },
                    },
                    where: {
                        active: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                award: { include: { icon: true } },
                creator: true,
                likes: {
                    where: {
                        active: true,
                    },
                },
                comments: {
                    where: {
                        active: true,
                    },
                },
            },
        });
    }

    public static async update(challenge: Challenge) {
        const result = await prisma.challenge.update({
            where: {
                id: challenge.id,
            },
            data: {
                timelineTimestamp: challenge.timelineTimestamp,
            },
        });

        return result;
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
                award: { include: { icon: true } },
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
                award: { include: { icon: true } },
                challengeParticipants: true,
                creator: true,
                likes: true,
                comments: true,
            },
        });
    }

    public static async register(userId: number, challengeId: number) {
        const result = await prisma.challengeParticipant.upsert({
            where: {
                unique_challenge_participant: {
                    userId,
                    challengeId,
                },
            },
            update: {
                active: true,
            },
            create: {
                userId,
                challengeId,
                active: true,
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

    public static async getParticipantCount(id: number) {
        return await prisma.challengeParticipant.count({
            where: {
                challengeId: id,
            },
        });
    }

    public static async isParticipant(id: number, userId: number) {
        const result = await prisma.challengeParticipant.findUnique({
            where: {
                unique_challenge_participant: {
                    challengeId: id,
                    userId: userId,
                },
            },
        });

        return !!result;
    }

    public static async getAllByTaskId(taskId: number) {
        const result = await prisma.challenge.findMany({
            where: {
                challengeRequirements: {
                    some: {
                        taskId,
                    },
                },
            },
            include: {
                challengeMilestones: {
                    include: {
                        challenge: true,
                    },
                },
            },
        });

        return result;
    }

    /*
     * this manual query to calculate the progress of a challenge requirement
     *
     * the general logic is to get one line item per "interval".
     * an interval would be 1 if it was for a daily challenge such as take cold shower every day for a month.
     * an interval would be 7 if it was run 3 times a week for a month.
     */
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
            SELECT floor(
                (
                    DATEDIFF(planned_day.date, '1971-01-01') - DATEDIFF(${startDateString}, '1971-01-01')
                ) / ${interval}
            ) AS intervalIndex,

            MIN(planned_day.date) AS intervalStartDate,
            SUM(completedQuantity) AS totalCompleted
     FROM planned_task
              JOIN planned_day ON plannedDayId = planned_day.id
              JOIN scheduled_habit ON scheduledHabitId = scheduled_habit.id
     WHERE planned_day.userId = ${userId}
       AND taskId = ${taskId}
       AND planned_task.active = true
       AND planned_day.date >= ${startDateString}
       AND planned_day.date <= ${endDateString}
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
     group by intervalIndex; 
            `
        );

        return result;
    }
}
