import { prisma } from '@database/prisma';

export class PointLedgerRecordDao {
    public static async upsert(
        userId: number,
        relevantId: number,
        pointDefinitionType: string,
        points: number
    ) {
        return await prisma.pointLedgerRecord.upsert({
            where: {
                unique_user_relevant_type: {
                    userId,
                    pointDefinitionType,
                    relevantId,
                },
            },
            update: {
                points,
            },
            create: {
                userId,
                relevantId,
                pointDefinitionType,
                points,
            },
        });
    }

    public static async sumPointsByUser(userId: number) {
        return await prisma.pointLedgerRecord.aggregate({
            where: {
                userId,
            },
            _sum: {
                points: true,
            },
        });
    }
}
