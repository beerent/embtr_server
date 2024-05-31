import { prisma } from '@database/prisma';
import { ScheduledHabit } from '@resources/schema';
import { PureDate } from '@resources/types/date/PureDate';

const DEFAULT_TIME_OF_DAY_ID = 5;

export class ScheduledHabitDao {
    public static async create(userId: number, scheduledHabit: ScheduledHabit) {
        let unit = {};
        if (scheduledHabit.unitId) {
            unit = {
                unit: {
                    connect: {
                        id: scheduledHabit.unitId ?? 1,
                    },
                },
            };
        }

        let icon = {};
        if (scheduledHabit.iconId) {
            icon = {
                icon: {
                    connect: {
                        id: scheduledHabit.iconId,
                    },
                },
            };
        }

        let daysOfWeekIds = scheduledHabit.daysOfWeek?.map((day) => day.id ?? 0);

        let timesOfDayIds = [DEFAULT_TIME_OF_DAY_ID];
        if (scheduledHabit.timesOfDayEnabled === true && scheduledHabit.timesOfDay) {
            timesOfDayIds = scheduledHabit.timesOfDay?.map((time) => time.id ?? 0);
        }

        return prisma.scheduledHabit.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                task: {
                    connect: {
                        id: scheduledHabit.taskId,
                    },
                },
                ...unit,
                ...icon,
                title: scheduledHabit.title,
                description: scheduledHabit.description,

                detailsEnabled: scheduledHabit.detailsEnabled === true,
                quantity: scheduledHabit.quantity ?? 1,
                daysOfWeekEnabled: scheduledHabit.daysOfWeekEnabled === true,
                daysOfWeek: {
                    connect: daysOfWeekIds?.map((id) => {
                        return {
                            id,
                        };
                    }),
                },
                timesOfDayEnabled: scheduledHabit.timesOfDayEnabled === true,
                timesOfDay: {
                    connect: timesOfDayIds?.map((id) => {
                        return {
                            id,
                        };
                    }),
                },
                startDate: scheduledHabit.startDate,
                endDate: scheduledHabit.endDate,
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async update(userId: number, scheduledHabit: ScheduledHabit) {
        let unitData = {};
        if (scheduledHabit.unitId) {
            unitData = {
                unit: {
                    connect: {
                        id: scheduledHabit.unitId ?? 1,
                    },
                },
            };
        }

        let titleData = {};
        if (scheduledHabit.title) {
            titleData = {
                title: scheduledHabit.title,
            };
        }

        let descriptionData = {};
        if (scheduledHabit.description) {
            descriptionData = {
                description: scheduledHabit.description,
            };
        }

        let iconData = {};
        if (scheduledHabit.iconId) {
            iconData = {
                icon: {
                    connect: {
                        id: scheduledHabit.iconId,
                    },
                },
            };
        }

        let quantityData = {};
        if (scheduledHabit.quantity) {
            quantityData = {
                quantity: scheduledHabit.quantity,
            };
        }

        let daysOfWeekData = {};
        if (scheduledHabit.daysOfWeek) {
            daysOfWeekData = {
                daysOfWeek: {
                    set: scheduledHabit.daysOfWeek?.map((dayOfWeek) => {
                        return {
                            id: dayOfWeek.id,
                        };
                    }),
                },
            };
        }

        let timesOfDayData = {};
        if (scheduledHabit.timesOfDay) {
            timesOfDayData = {
                timesOfDay: {
                    set: scheduledHabit.timesOfDay?.map((timeOfDay) => {
                        return {
                            id: timeOfDay.id,
                        };
                    }),
                },
            };
        }

        let timesOfDayEnabledData = {};
        if (scheduledHabit.timesOfDayEnabled != undefined) {
            timesOfDayEnabledData = {
                timesOfDayEnabled: scheduledHabit.timesOfDayEnabled === true,
            };
        }

        let daysOfWeekEnabledData = {};
        if (scheduledHabit.daysOfWeekEnabled != undefined) {
            daysOfWeekEnabledData = {
                daysOfWeekEnabled: scheduledHabit.daysOfWeekEnabled === true,
            };
        }

        let detailsEnabledData = {};
        if (scheduledHabit.detailsEnabled != undefined) {
            detailsEnabledData = {
                detailsEnabled: scheduledHabit.detailsEnabled === true,
            };
        }

        let endDate = {};
        if (scheduledHabit.endDate) {
            endDate = {
                endDate: scheduledHabit.endDate,
            };
        }

        return prisma.scheduledHabit.update({
            where: {
                id: scheduledHabit.id,
            },
            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                ...unitData,
                ...titleData,
                ...descriptionData,
                ...iconData,
                ...quantityData,
                ...daysOfWeekData,
                ...timesOfDayData,
                ...timesOfDayEnabledData,
                ...daysOfWeekEnabledData,
                ...detailsEnabledData,
                ...endDate,
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async archive(userId: number, id: number, date: Date) {
        return prisma.scheduledHabit.updateMany({
            where: {
                id: id,
                userId: userId,
            },
            data: {
                endDate: date,
            },
        });
    }

    public static async replace(
        id: number,
        userId: number,
        taskId: number,
        description?: string,
        quantity?: number,
        unitId?: number,
        daysOfWeekIds?: number[],
        timesOfDayIds?: number[],
        startDate?: Date,
        endDate?: Date
    ) {
        return prisma.scheduledHabit.update({
            where: {
                id: id,
            },

            data: {
                user: {
                    connect: {
                        id: userId,
                    },
                },
                task: {
                    connect: {
                        id: taskId,
                    },
                },
                description: description,
                quantity: quantity ?? 1,
                daysOfWeek: daysOfWeekIds
                    ? {
                        set: daysOfWeekIds?.map((id) => {
                            return {
                                id,
                            };
                        }),
                    }
                    : undefined,
                timesOfDay: timesOfDayIds
                    ? {
                        set: timesOfDayIds?.map((id) => {
                            return {
                                id,
                            };
                        }),
                    }
                    : undefined,
                unit: unitId
                    ? {
                        connect: {
                            id: unitId,
                        },
                    }
                    : undefined,
                startDate,
                endDate,
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async get(id: number) {
        return prisma.scheduledHabit.findUnique({
            where: {
                id: id,
            },
            include: {
                icon: true,
                task: {
                    include: {
                        icon: true,
                        challengeRequirements: {
                            include: {
                                challenge: {
                                    select: {
                                        start: true,
                                        end: true,
                                    },
                                },
                            },
                        },
                    },
                },
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async getAllByHabitIdAndUserId(habitId: number, userId: number) {
        return prisma.scheduledHabit.findMany({
            where: {
                taskId: habitId,
                userId: userId,
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
            orderBy: {
                startDate: 'asc',
            },
        });
    }

    public static async getAll(userId: number) {
        return prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async getSummaries(userId: number) {
        return prisma.scheduledHabit.groupBy({
            by: ['taskId'],
            where: {
                userId: userId,
            },
            _count: {
                taskId: true,
            },
            _sum: {
                quantity: true,
            },
            _min: {
                startDate: true,
            },
            _max: {
                endDate: true,
            },
        });
    }

    public static async getRecent(userId: number) {
        return prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
                OR: [
                    {
                        startDate: null,
                    },
                    {
                        startDate: {
                            lte: new Date(), // this may need to be yesterday
                        },
                    },
                ],
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static getPast(userId: number, date: PureDate) {
        return prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
                endDate: {
                    lt: date + 'T00:00:00.000Z',
                },
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async getActive(userId: number, date: PureDate) {
        return prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
                OR: [
                    {
                        endDate: null,
                    },
                    {
                        endDate: {
                            gte: date + 'T00:00:00.000Z',
                        },
                    },
                ],
            },
            include: {
                icon: true,
                task: {
                    include: {
                        icon: true,
                    },
                },
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static getFuture(userId: number, date: PureDate) {
        return prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
                startDate: {
                    gt: date + 'T00:00:00.000Z',
                },
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async getForUserInDateRange(
        userId: number,
        startDate: PureDate,
        endDate: PureDate
    ) {
        return prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
                AND: [
                    {
                        OR: [
                            {
                                startDate: null,
                            },
                            {
                                startDate: {
                                    lte: endDate + 'T00:00:00.000Z',
                                },
                            },
                        ],
                    },
                    {
                        OR: [
                            {
                                endDate: null,
                            },
                            {
                                endDate: {
                                    gte: startDate + 'T00:00:00.000Z',
                                },
                            },
                        ],
                    },
                ],
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async getForUserAndDayOfWeekAndDate(
        userId: number,
        dayOfWeek: number,
        date: Date
    ) {
        return prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
                OR: [
                    {
                        daysOfWeek: {
                            some: {
                                id: dayOfWeek,
                            },
                        },
                    },
                    {
                        daysOfWeekEnabled: false,
                    },
                ],
                AND: [
                    {
                        OR: [
                            {
                                startDate: null,
                            },
                            {
                                startDate: {
                                    lte: date,
                                },
                            },
                        ],
                    },
                    {
                        OR: [
                            {
                                endDate: null,
                            },
                            {
                                endDate: {
                                    gt: date,
                                },
                            },
                        ],
                    },
                ],
            },
            include: {
                icon: true,
                task: {
                    include: {
                        icon: true,
                    },
                },
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }

    public static async delete(id: number) {
        return prisma.scheduledHabit.delete({
            where: {
                id: id,
            },
        });
    }

    public static async count(userId: number) {
        return prisma.scheduledHabit.count({
            where: {
                userId: userId,
            },
        });
    }

    public static async getAllByUserIdAndTaskId(userId: number, taskId: number) {
        return prisma.scheduledHabit.findMany({
            where: {
                userId: userId,
                taskId: taskId,
            },
            include: {
                task: true,
                unit: true,
                daysOfWeek: true,
                timesOfDay: true,
            },
        });
    }
}
