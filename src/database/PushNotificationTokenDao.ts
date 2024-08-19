import { prisma } from '@database/prisma';

export class PushNotificationTokenDao {
    public static async getAllById(id: number) {
        const tokens = await prisma.pushNotificationToken.findMany({
            where: {
                user: {
                    id,
                },
            },
            include: {
                user: true,
            },
        });

        return tokens;
    }

    public static async create(uid: string, token: string) {
        const tokenModel = await prisma.pushNotificationToken.create({
            data: {
                token,
                user: {
                    connect: {
                        uid,
                    },
                },
            },
        });

        return tokenModel;
    }

    public static async invalidateAll(ids: number[]) {
        await prisma.pushNotificationToken.updateMany({
            where: {
                id: {
                    in: ids,
                },
            },
            data: {
                active: false,
            },
        });
    }
}
