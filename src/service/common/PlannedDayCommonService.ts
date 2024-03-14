import { ScheduledHabit, PlannedDay } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';

export class PlannedDayCommonService {
    public static generateCompletionState(
        scheduledHabits: ScheduledHabit[],
        plannedDayDate: Date,
        plannedDay?: PlannedDay
    ): Constants.CompletionState {
        const scheduledHabitCount = this.getScheduledActiveHabitCount(
            scheduledHabits,
            plannedDayDate
        );
        if (scheduledHabitCount === 0) {
            return Constants.CompletionState.INVALID;
        }

        // at this point we do have expected scheduled habits
        // ==================================================================

        // user hasn't started the day, consider it incomplete
        if (!plannedDay) {
            return Constants.CompletionState.FAILED;
        }

        const plannedTaskCount = plannedDay.plannedTasks?.length ?? 0;

        // user hasn't started all tasks, consider it incomplete
        if (scheduledHabitCount !== plannedTaskCount) {
            return Constants.CompletionState.FAILED;
        }

        const hasFailed = plannedDay.plannedTasks?.some((task) => {
            if (task.active === false) {
                return false;
            }

            return task.status === Constants.CompletionState.FAILED;
        });
        if (hasFailed) {
            return Constants.CompletionState.FAILED;
        }

        const complete: boolean =
            plannedDay.plannedTasks?.every((task) => {
                if (task.active === false) {
                    return true;
                }

                if (task.status === Constants.CompletionState.SKIPPED) {
                    return true;
                }

                return (task.completedQuantity ?? 0) >= (task.quantity ?? 1);
            }) ?? false;

        if (complete) {
            return Constants.CompletionState.COMPLETE;
        }

        return Constants.CompletionState.FAILED;
    }

    private static getScheduledActiveHabitCount(
        scheduledHabits: ScheduledHabit[],
        plannedDayDate: Date
    ): number {
        const plannedDayDayOfWeek = plannedDayDate.getDay() + 1;
        const scheduledHabitsForDayOfWeek = scheduledHabits.filter(
            (scheduledHabit) =>
                scheduledHabit.daysOfWeek?.some((dayOfWeek) => dayOfWeek.id === plannedDayDayOfWeek)
        );

        const scheduledHabitsInDateRange = scheduledHabitsForDayOfWeek.filter((scheduledHabit) => {
            const startDate = scheduledHabit.startDate;
            const endDate = scheduledHabit.endDate;

            const startDateIsBeforePlannedDay = !startDate || plannedDayDate >= startDate;
            const endDateIsAfterPlannedDay = !endDate || plannedDayDate <= endDate;
            return startDateIsBeforePlannedDay && endDateIsAfterPlannedDay;
        });

        const scheduledHabitCount = scheduledHabitsInDateRange.reduce((acc, scheduledHabit) => {
            let timeOfDayCount = scheduledHabit.timesOfDay?.length ?? 0;
            if (timeOfDayCount === 0) {
                timeOfDayCount = 1;
            }

            return acc + timeOfDayCount;
        }, 0);

        return scheduledHabitCount;
    }
}
