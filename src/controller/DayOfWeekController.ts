import { prisma } from '@database/prisma';

export class DayOfWeekController {
    public static async get(id: number) {
        return prisma.dayOfWeek.findUnique({
            where: {
                id,
            },
        });
    }

    public static async getAll() {
        return prisma.dayOfWeek.findMany({
            where: {
                id: {
                    not: 9,
                },
            },
        });
    }
}
