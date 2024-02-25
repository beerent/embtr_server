import { prisma } from '@database/prisma';

export class UserRoleDao {
    public static async get(id: number) {
        return prisma.timeOfDay.findUnique({
            where: {
                id,
            },
        });
    }

    public static async getAll() {
        return prisma.timeOfDay.findMany({
            where: {
                id: {
                    not: 9,
                },
            },
        });
    }
}
