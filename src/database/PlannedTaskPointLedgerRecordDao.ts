import { prisma } from '@database/prisma';

export class PlannedTaskPointLedgerRecordDao {
    public static async upsert(userId: number, plannedTaskId: number, pointDefinitionId: number) {
        return await prisma.plannedTaskPointLedgerRecord.upsert({
            where: {
                plannedTaskId,
            },
            update: {
                pointDefinitionId,
            },
            create: {
                userId,
                plannedTaskId,
                pointDefinitionId,
            },
        });
    }
}
