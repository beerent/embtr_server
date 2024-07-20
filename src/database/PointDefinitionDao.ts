import { prisma } from '@database/prisma';

export class PointDefinitionDao {
    public static async getLatestVersion(type: string) {
        return prisma.pointDefinition.findFirst({
            where: {
                type,
            },
            orderBy: {
                version: 'desc',
            },
        });
    }
}
