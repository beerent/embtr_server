import { prisma } from '@database/prisma';
import { DailyHistory, DayResult } from '@resources/types/widget/DailyHistory';

export class DailyHistoryController {
    public static async get(userId: number, startDate: Date, endDate: Date): Promise<DailyHistory> {
        const plannedDays = await prisma.plannedDay.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                dayKey: true,
                date: true,
                plannedTasks: {
                    select: {
                        status: true,
                    },
                    where: { active: true },
                },
            },
        });

        const history: DayResult[] = [];

        const endDateUtc = new Date(endDate);
        endDateUtc.setUTCHours(0, 0, 0, 0);

        const startDateUtc = new Date(startDate);
        startDateUtc.setUTCHours(0, 0, 0, 0);

        for (let d = new Date(startDateUtc); d <= endDateUtc; d.setDate(d.getDate() + 1)) {
            const day = plannedDays.find(
                (plannedDay) => plannedDay.date.toDateString() === d.toDateString()
            );

            if (!day) {
                history.push({
                    date: new Date(d),
                    dayKey: d.toISOString().split('T')[0],
                    complete: false,
                });
            } else {
                const complete =
                    day.plannedTasks.length > 0 &&
                    day.plannedTasks.every((task) => task.status === 'COMPLETE');
                history.push({
                    date: day.date,
                    dayKey: day.dayKey,
                    complete,
                });
            }
        }

        return { history };
    }
}
