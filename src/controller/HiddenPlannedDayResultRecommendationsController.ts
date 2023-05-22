import { prisma } from '@database/prisma';

export class HiddenPlannedDayResultRecommendationsController {
    public static async create(userId: number, dayKey: string) {
        return await prisma.hiddenPlannedDayResultRecommendations.create({
            data: {
                plannedDay: {
                    connect: {
                        unique_user_daykey: {
                            userId: userId,
                            dayKey: dayKey,
                        },
                    },
                },
            },
        });
    }
}
