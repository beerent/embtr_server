import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';

export type HabitCategoryPrisma = Prisma.PromiseReturnType<typeof HabitCategoryDao.getAllGeneric>;

const CUSTOM_HABITS_CATEGORY_ID = 13;
const RECENT_HABITS_CATEGORY_ID = 14;
const ACTIVE_HABITS_CATEGORY_ID = 15;

export class HabitCategoryDao {
    public static async getAllGeneric() {
        return prisma.habitCategory.findMany({
            where: {
                active: true,
                generic: true,
            },
            include: {
                tasks: {
                    include: {
                        icon: true,
                    },
                },
            },
        });
    }

    public static async getById(id: number) {
        return prisma.habitCategory.findUnique({
            where: {
                id: id,
            },
            include: {
                tasks: true,
            },
        });
    }

    public static async getCustom(userId: number) {
        return prisma.habitCategory.findUnique({
            where: {
                id: CUSTOM_HABITS_CATEGORY_ID,
            },
            include: {
                tasks: {
                    where: {
                        userId: userId,
                        active: true,
                    },
                },
            },
        });
    }

    public static async getRecent() {
        return this.getById(RECENT_HABITS_CATEGORY_ID);
    }

    public static async getActive() {
        return this.getById(ACTIVE_HABITS_CATEGORY_ID);
    }
}
