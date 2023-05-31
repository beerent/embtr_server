import { prisma } from '@database/prisma';

export class SeasonController {
    public static async getSeasonForDay(date: Date) {
        return prisma.season.findFirst({
            where: {
                date: {
                    lte: date,
                },
            },
            orderBy: {
                id: 'desc',
            },
        });
    }

    public static async getLastNSeasonsFromDay(n: number, date: Date) {
        return prisma.season.findMany({
            where: {
                date: {
                    lte: date,
                },
            },
            orderBy: {
                id: 'desc',
            },
            take: n,
        });
    }

}