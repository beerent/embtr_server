import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export type PlannedDayWithUserReturnType = Prisma.PromiseReturnType<typeof PlannedDayController.get>;

export class PlannedDayController {
    public static async get(id: number) {
        try {
            return await prisma.plannedDay.findUnique({
                where: {
                    id: id,
                },
                include: {
                    user: true,
                },
            });
        } catch (error) {
            console.error(error);
        }

        return null;
    }
}
