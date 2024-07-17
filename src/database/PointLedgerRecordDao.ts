import { prisma } from '@database/prisma';

export class PointLedgerRecordDao {
    public static async create(
        userId: number,
        action: string,
        version: number,
        transactionType: string,
        relevantId?: number
    ) {
        return prisma.pointLedgerRecord.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                pointDefinition: {
                    connect: {
                        unique_action_version: {
                            action,
                            version,
                        },
                    },
                },
                relevantId,
                transactionType,
            },
            include: {
                pointDefinition: {
                    select: {
                        value: true,
                    },
                },
            },
        });
    }

    public static async sumByTransactionType(userId: number, transactionType: string) {
        const records = await prisma.pointLedgerRecord.findMany({
            where: {
                userId,
                transactionType,
            },
            include: {
                pointDefinition: {
                    select: {
                        value: true,
                    },
                },
            },
        });

        return records.reduce((acc, record) => acc + record.pointDefinition.value, 0);
    }
}
