import { prisma } from '@database/prisma';

export class UserStreakDao {
    public static async get(id: number) {
        const widget = await prisma.widget.findUnique({
            where: {
                id,
            },
        });

        return widget;
    }
}
