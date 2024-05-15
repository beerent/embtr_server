import { prisma } from '@database/prisma';

export class UserMilestoneDao {
    public static deleteForPlannedDay(userId: number, plannedDayId: number) {
        return prisma.userMilestone.deleteMany({
            where: {
                plannedDayId,
                userId,
            },
        });
    }
}
