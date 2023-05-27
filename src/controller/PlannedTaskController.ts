import { prisma } from '@database/prisma';
import { PlannedDay, PlannedTask, Task, Habit, Prisma } from '@prisma/client';
import { PlannedTask as PlannedTaskModel } from '@resources/schema';

export type PlannedTaskFull = PlannedTask & { task: Task; plannedDay: PlannedDay };
export type HabitJourneyQueryResults = Prisma.PromiseReturnType<
    typeof PlannedTaskController.getHabitJourneys
>;

export class PlannedTaskController {
    public static async create(
        plannedDay: PlannedDay,
        task: Task,
        habit?: Habit
    ): Promise<PlannedTask | null> {
        const data = {
            plannedDay: {
                connect: {
                    id: plannedDay.id,
                },
            },
            task: {
                connect: {
                    id: task.id,
                },
            },
            habit: {},
            status: 'INCOMPLETE',
            count: 1,
        };

        if (habit !== undefined) {
            data.habit = {
                connect: {
                    id: habit.id,
                },
            };
        }

        return prisma.plannedTask.upsert({
            create: data,
            update: {
                count: { increment: 1 },
                habit: data.habit,
            },
            where: {
                unique_planned_day_task: {
                    plannedDayId: plannedDay.id,
                    taskId: task.id,
                },
            },
        });
    }

    public static async update(plannedTask: PlannedTaskModel): Promise<PlannedTaskFull> {
        const status = plannedTask.status !== undefined ? { status: plannedTask.status } : {};
        const count = plannedTask.count !== undefined ? { count: plannedTask.count } : {};
        const habit =
            plannedTask.habitId !== undefined
                ? { habitId: plannedTask.habitId }
                : { habitId: null };
        const completedCount =
            plannedTask.completedCount !== undefined
                ? { completedCount: plannedTask.completedCount }
                : {};

        const result = await prisma.plannedTask.update({
            where: {
                id: plannedTask.id,
            },
            data: {
                ...status,
                ...habit,
                ...count,
                ...completedCount,
            },
            include: {
                task: true,
                plannedDay: true,
            },
        });

        return result;
    }

    public static async get(id: number): Promise<PlannedTaskFull | null> {
        return prisma.plannedTask.findUnique({
            where: {
                id,
            },
            include: {
                task: true,
                plannedDay: true,
            },
        });
    }

    public static async getByPlannedDayIdAndTaskId(plannedDayId: number, taskId: number) {
        return prisma.plannedTask.findUnique({
            where: {
                unique_planned_day_task: {
                    plannedDayId,
                    taskId,
                },
            },
            include: {
                task: true,
                plannedDay: true,
            },
        });
    }

    public static async deleteByUserIdAndPlannedDayIdAndTaskId(
        userId: number,
        plannedDayId: number,
        taskId: number
    ) {
        return prisma.plannedTask.deleteMany({
            where: {
                plannedDay: {
                    userId,
                    id: plannedDayId,
                },
                taskId,
            },
        });
    }

    public static async getRecent(userId: number, limit: number) {
        const result = await prisma.plannedTask.groupBy({
            by: ['taskId', 'createdAt'],
            where: {
                plannedDay: {
                    userId,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return result;
    }

    public static async getHabitJourneys(userId: number) {
        const result = await prisma.$queryRaw(
            Prisma.sql`SELECT habit.id as habitId, habit.title as habitTitle, habit.iconName as iconName, habit.iconSource as iconSource,
DATE(planned_day.date - INTERVAL (WEEKDAY(planned_day.date) + 1) DAY) AS season,
COUNT(distinct planned_day.id) as daysInSeason
FROM planned_task
JOIN task ON planned_task.taskId = task.id
JOIN habit ON planned_task.habitId = habit.id
JOIN planned_day ON plannedDayId = planned_day.id
WHERE userId = ${userId}
AND planned_day.date >= '2023-01-01' 
GROUP BY habit.id, season;`
        );

        const formattedResults = result as unknown[];
        formattedResults.forEach((row: any) => {
            row.daysInSeason = parseInt(row.daysInSeason);
        });

        return formattedResults;
    }
}
