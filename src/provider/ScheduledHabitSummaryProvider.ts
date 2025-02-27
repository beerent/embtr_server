import { ScheduledHabit, Task } from '@resources/schema';
import { PureDate } from '@resources/types/date/PureDate';
import { HabitSummary } from '@resources/types/habit/Habit';

export class ScheduledHabitSummaryProvider {
    public static createSummaries(scheduledHabits: ScheduledHabit[], cutoffDate: PureDate) {
        const taskToScheduledHabitMap = this.buildTaskToScheduledHabitMap(scheduledHabits);
        const habitSummaries = this.buildHabitSummaries(taskToScheduledHabitMap, cutoffDate);
        this.sortHabitSummaries(habitSummaries);

        return habitSummaries;
    }

    private static buildTaskToScheduledHabitMap(scheduledHabitModels: ScheduledHabit[]) {
        const taskToScheduledHabitMap: Map<Task, ScheduledHabit[]> = new Map();
        for (const scheduledHabitModel of scheduledHabitModels) {
            if (!scheduledHabitModel.task) {
                continue;
            }

            const exists = taskToScheduledHabitMap.get(scheduledHabitModel.task);
            if (exists) {
                exists.push(scheduledHabitModel);
                continue;
            }

            taskToScheduledHabitMap.set(scheduledHabitModel.task, [scheduledHabitModel]);
        }

        return taskToScheduledHabitMap;
    }

    private static buildHabitSummaries(
        taskToScheduledHabitMap: Map<Task, ScheduledHabit[]>,
        cutoffDate: PureDate
    ) {
        const habitSummaries: HabitSummary[] = [];
        for (const task of taskToScheduledHabitMap.keys()) {
            const scheduledHabits = taskToScheduledHabitMap.get(task);
            if (!scheduledHabits) {
                continue;
            }

            const recentHabitDates = this.getRecentHabitDates(scheduledHabits, cutoffDate);

            let previousDaysApart: number | undefined = undefined;
            if (recentHabitDates.lastScheduledHabitDate) {
                previousDaysApart = cutoffDate.daysApart(recentHabitDates.lastScheduledHabitDate);
            }

            let upcomingDaysApart: number | undefined = undefined;
            if (recentHabitDates.nextScheduledHabitDate) {
                upcomingDaysApart = cutoffDate.daysApart(recentHabitDates.nextScheduledHabitDate);
            }

            const activeScheduledCount = scheduledHabits.filter((scheduledHabit) => {
                if (!scheduledHabit.startDate) {
                    return true;
                }

                const startPureDate = PureDate.fromDateOnServer(scheduledHabit.startDate);
                return startPureDate >= cutoffDate;
            }).length;

            const habitSummary: HabitSummary = {
                task: task,
                lastHabitDays: previousDaysApart,
                nextHabitDays: upcomingDaysApart,
                activeScheduledCount: activeScheduledCount,
                currentStreak: 0,
            };
            habitSummaries.push(habitSummary);
        }

        return habitSummaries;
    }

    private static getRecentHabitDates(scheduledHabits: ScheduledHabit[], cutoffDate: PureDate) {
        let foundLastScheduledHabit: ScheduledHabit | undefined;
        let foundNextScheduledHabit: ScheduledHabit | undefined;

        for (const currentScheduledHabit of scheduledHabits) {
            const startDate = currentScheduledHabit.startDate;
            if (!startDate) {
                continue;
            }

            const currentStartDate = PureDate.fromDateOnServer(startDate);

            if (currentStartDate < cutoffDate) {
                if (!foundLastScheduledHabit || !foundLastScheduledHabit.startDate) {
                    foundLastScheduledHabit = currentScheduledHabit;
                    continue;
                }

                const lastStartDate = PureDate.fromDateOnServer(foundLastScheduledHabit.startDate);

                if (currentStartDate > lastStartDate) {
                    foundLastScheduledHabit = currentScheduledHabit;
                }
            } else {
                if (!foundNextScheduledHabit || !foundNextScheduledHabit.startDate) {
                    foundNextScheduledHabit = currentScheduledHabit;
                    continue;
                }

                const foundNextStartDate = PureDate.fromDateOnServer(
                    foundNextScheduledHabit.startDate
                );

                if (currentStartDate < foundNextStartDate) {
                    foundNextScheduledHabit = currentScheduledHabit;
                }
            }
        }

        const result = {
            lastScheduledHabitDate: foundLastScheduledHabit?.startDate
                ? PureDate.fromDateOnServer(foundLastScheduledHabit.startDate)
                : undefined,
            nextScheduledHabitDate: foundNextScheduledHabit?.startDate
                ? PureDate.fromDateOnServer(foundNextScheduledHabit.startDate)
                : undefined,
        };

        return result;
    }

    private static sortHabitSummaries(habitSummaries: HabitSummary[]) {
        habitSummaries.sort((a, b) => {
            if (a.nextHabitDays || b.nextHabitDays) {
                return (a.nextHabitDays || 0) - (b.nextHabitDays || 0);
            }

            if (a.lastHabitDays || b.lastHabitDays) {
                return -1 * (a.lastHabitDays || 0) - -1 * (b.lastHabitDays || 0);
            }

            return 0;
        });
    }
}
