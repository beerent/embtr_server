import { prisma } from '@database/prisma';

export class PointLedgerDao {
    public static async create(userId: number, pointDefinitionAction: string, relevantId?: number) {
        return prisma.pointLedger.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                pointDefinition: {
                    connect: {
                        action: pointDefinitionAction,
                    },
                },
                relevantId,
            },
        });
    }
}
