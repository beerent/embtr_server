import { prisma } from '@database/prisma';

export class MetadataDao {
    public static async getAll() {
        const allMetadata = await prisma.metadata.findMany();
        return allMetadata;
    }
    public static async get(key: string) {
        const metadata = await prisma.metadata.findUnique({
            where: {
                key,
            },
        });

        return metadata;
    }

    public static async set(key: string, value: string) {
        const metadata = await prisma.metadata.upsert({
            where: {
                key,
            },
            update: {
                value,
            },
            create: {
                key,
                value,
            },
        });

        return metadata;
    }

    public static async delete(key: string) {
        const metadata = await prisma.metadata.delete({
            where: {
                key,
            },
        });

        return metadata;
    }
}
