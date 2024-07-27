import { prisma } from '@database/prisma';
import { Constants } from '@resources/types/constants/constants';
import { MetadataBody } from '@resources/types/requests/MetadataTypes';

export class MetadataDao {
    public static async getAll() {
        const allMetadata = await prisma.metadata.findMany();
        return allMetadata;
    }

    public static async get(key: Constants.MetadataKey) {
        const metadata = await prisma.metadata.findUnique({
            where: {
                key,
            },
        });

        return metadata;
    }

    public static async create(key: string, value: string) {
        const metadata = await prisma.metadata.create({
            data: {
                key,
                value,
            },
        });

        return metadata;
    }

    public static async update(id: number, data: MetadataBody) {
        const metadata = await prisma.metadata.update({
            where: {
                id,
            },
            data: {
                ...(data.key && {
                    key: data.key,
                }),
                value: data.value,
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

    public static async delete(id: number) {
        const metadata = await prisma.metadata.delete({
            where: {
                id,
            },
        });

        return metadata;
    }
}
