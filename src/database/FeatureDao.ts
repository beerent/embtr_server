import { prisma } from '@database/prisma';

export class FeatureDao {
    public static async getAll() {
        const features = await prisma.feature.findMany();

        return features;
    }

    public static async getById(featureId: number) {
        const feature = await prisma.feature.findUnique({
            where: {
                id: featureId,
            },
        });

        return feature;
    }
}
