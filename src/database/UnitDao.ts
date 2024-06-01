import { prisma } from '@database/prisma';
import { Unit } from '@resources/schema';

export class UnitDao {
    public static async get(id: number) {
        return prisma.unit.findUnique({
            where: {
                id,
            },
        });
    }

    public static async create(unit: Unit) {
        return prisma.unit.create({
            data: {
                unit: unit.unit ?? '',
                abreveation: unit.abreveation ?? '',
                stepSize: unit.stepSize ?? 1
            }
        });
    }

    public static async getAll() {
        return prisma.unit.findMany({
            where: {
                id: {
                    not: 9,
                },
            },
        });
    }
}
