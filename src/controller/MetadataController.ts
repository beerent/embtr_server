import { prisma } from '@database/prisma';

export class MetadataController {
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
}
