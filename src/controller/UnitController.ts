import { prisma } from '@database/prisma';

export class UnitController {

    public static async get(id: number) {
        return prisma.unit.findUnique({
            where: {
                id,
            },
        });
    }

    public static async getAll() {
        return prisma.unit.findMany();
    }
}
