import { prisma } from '@database/prisma';

export class MetadataController {
    public static async getAll() {
        const allMetadata = await prisma.metadata.findMany();
        return allMetadata;
    }
}
