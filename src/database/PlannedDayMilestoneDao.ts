import { prisma } from '@database/prisma';

export class PlannedDayMilestoneDao {
    public static async getAllForUserInList(userId: number, ids: number[]) {
        return prisma.plannedDayMilestone.findMany({
            where: {
                plannedDay: {
                    userId,
                },
                milestoneId: {
                    in: ids,
                },
            },
        });
    }

    public static async deleteAllForUserWithMilestoneInList(
        userId: number,
        challengeMilestoneIds: number[]
    ) {
        return prisma.plannedDayMilestone.deleteMany({
            where: {
                plannedDay: {
                    userId,
                },
                milestone: {
                    challengeMilestones: {
                        some: {
                            milestoneId: {
                                in: challengeMilestoneIds,
                            },
                        },
                    },
                },
            },
        });
    }

    public static async deleteAllForPlannedDayInList(plannedDayId: number, ids: number[]) {
        return prisma.plannedDayMilestone.deleteMany({
            where: {
                plannedDayId,
                milestoneId: {
                    in: ids,
                },
            },
        });
    }

    public static async getAllByPlannedDay(plannedDayId: number) {
        return prisma.plannedDayMilestone.findMany({
            where: {
                plannedDayId,
            },
        });
    }

    public static async create(plannedDayId: number, milestoneId: number) {
        return prisma.plannedDayMilestone.create({
            data: {
                plannedDayId,
                milestoneId,
            },
        });
    }
}
