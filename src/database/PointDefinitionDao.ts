import { prisma } from '@database/prisma';

export class PointDefinitionDao {
    public static async getLatestVersion(action: string) {
        return prisma.pointDefinition.findFirst({
            where: {
                action,
            },
            orderBy: {
                version: 'desc',
            },
        });
    }
}
