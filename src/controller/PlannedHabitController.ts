import { prisma } from '@database/prisma';
import { Prisma } from '@prisma/client';
import { PlannedTask as PlannedTaskModel } from '@resources/schema';

export type PlannedTaskFull = Prisma.PromiseReturnType<typeof PlannedHabitController.get>;
export type HabitJourneyQueryResults = Prisma.PromiseReturnType<
    typeof PlannedHabitController.getHabitJourneys
>;

// ¯\_(ツ)_/¯ - weakpotatoclone - 2023-06-02
// ¯\_(ツ)_/¯ - weakpotatoclone - 2023-06-28

export class PlannedHabitController {
    public static async upsert(initialData: PlannedTaskModel, updateData: PlannedTaskModel) {
        const {
            title = initialData.title,
            description = initialData.description,
            iconUrl = initialData.iconUrl,
            quantity = initialData.quantity,
            completedQuantity = initialData.completedQuantity,
            status = initialData.status ?? '',
            active = initialData.active,
            id = initialData.id,
            plannedDayId = initialData.plannedDayId,
            scheduledHabitId = initialData.scheduledHabitId,
            unitId = initialData.unitId,
            timeOfDayId = initialData.timeOfDayId,
        } = updateData;

        const unit = unitId
            ? {
                  unit: {
                      connect: {
                          id: unitId,
                      },
                  },
              }
            : { unit: { disconnect: true } };

        const timeOfDay = timeOfDayId
            ? {
                  timeOfDay: {
                      connect: {
                          id: timeOfDayId,
                      },
                  },
              }
            : { timeOfDay: { disconnect: true } };

        const data = {
            plannedDay: {
                connect: {
                    id: plannedDayId,
                },
            },
            scheduledHabit: {
                connect: {
                    id: scheduledHabitId,
                },
            },
            ...unit,
            ...timeOfDay,
            title,
            description,
            iconUrl,
            quantity,
            completedQuantity,
            status,
            active,
        };

        const result = await prisma.plannedTask.upsert({
            where: {
                id: id,
            },
            create: {
                ...data,
            },
            update: {
                ...data,
            },
            include: {
                plannedDay: true,
                scheduledHabit: true,
                timeOfDay: true,
                unit: true,
            },
        });

        return result;
    }

    public static async get(id: number) {
        return prisma.plannedTask.findUnique({
            where: {
                id,
            },
            include: {
                plannedDay: true,
                scheduledHabit: true,
                timeOfDay: true,
                unit: true,
            },
        });
    }

    public static async getByPlannedDayIdAndTaskId(plannedDayId: number, taskId: number) {
        return prisma.plannedTask.findMany({
            where: {
                active: true,
                plannedDay: {
                    id: plannedDayId,
                },
            },
            include: {
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
            },
        });
    }

    public static async getHabitJourneys(userId: number) {
        const result = await prisma.$queryRaw(
            Prisma.sql`
SELECT habit.id                                                                      as habitId,
       habit.title                                                                   as habitTitle,
       habit.iconName                                                                as iconName,
       habit.iconSource                                                              as iconSource,
       season.id                                                                     as season,
       DATE(planned_day.date - INTERVAL (((WEEKDAY(planned_day.date) + 7) % 7)) DAY) AS seasonDate,
       COUNT(distinct planned_day.id)                                                as daysInSeason
FROM planned_task
         JOIN task ON planned_task.taskId = task.id
         JOIN habit ON planned_task.habitId = habit.id
         JOIN planned_day ON plannedDayId = planned_day.id
         JOIN season on season.date = DATE(planned_day.date - INTERVAL (((WEEKDAY(planned_day.date) + 7) % 7)) DAY)
WHERE userId = ${userId}
  AND planned_day.date >= '2023-01-01'
  AND status != 'FAILED'
  AND planned_task.active = true
  AND planned_task.quantity > 0
  AND planned_task.completedQuantity >= planned_task.quantity
GROUP BY habit.id, seasonDate, season
order by habitId desc, seasonDate desc;
`
        );

        const formattedResults = result as unknown[];
        formattedResults.forEach((row: any) => {
            row.daysInSeason = parseInt(row.daysInSeason);
        });

        return formattedResults;
    }
}
