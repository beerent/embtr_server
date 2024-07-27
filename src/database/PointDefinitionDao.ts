import { prisma } from '@database/prisma';

export class PointDefinitionDao {
    public static async getAll() {
        return prisma.pointDefinition.findMany();
    }

    public static async getAllLatestVersions() {
        return prisma.pointDefinition.findMany({
            distinct: ['type'],
            orderBy: {
                version: 'desc',
            },
        });
    }

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
