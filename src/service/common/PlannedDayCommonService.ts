import { ScheduledHabit, PlannedTask } from '@resources/schema';
import { Constants } from '@resources/types/constants/constants';

export class PlannedDayCommonService {
    public static generateCompletionState(
        scheduledHabits: ScheduledHabit[],
        plannedDayDate: Date,
        plannedHabits: PlannedTask[]
    ): Constants.CompletionState {
        const scheduledHabitCount = this.getScheduledActiveHabitCount(
            scheduledHabits,
            plannedDayDate
        );
        if (scheduledHabitCount === 0) {
            return Constants.CompletionState.NO_SCHEDULE;
        }

        // at this point we do have expected scheduled habits
        // ==================================================================

        const plannedTaskCount = plannedHabits.length ?? 0;

        const containsFailedPlannedTask = plannedHabits.some((task) => {
            return task.status === Constants.CompletionState.FAILED;
        });

        if (containsFailedPlannedTask) {
            return Constants.CompletionState.FAILED;
        }

        const hasFewerTasksThanScheduled = plannedTaskCount < scheduledHabitCount;
        if (hasFewerTasksThanScheduled) {
            return Constants.CompletionState.INCOMPLETE;
        }

        const allTasksAreComplete = plannedHabits.every((task) => {
            const taskWasRemoved = task.active === false;
            if (taskWasRemoved) {
                return true;
            }

            const taskWasSkipped = task.status === Constants.CompletionState.SKIPPED;
            if (taskWasSkipped) {
                return true;
            }

            const completedQuantity = task.completedQuantity ?? 0;
            const quantity = task.quantity ?? 1;

            const taskIsComplete = completedQuantity >= quantity;
            return taskIsComplete;
        });

        if (allTasksAreComplete) {
            return Constants.CompletionState.COMPLETE;
        }

        return Constants.CompletionState.FAILED;
    }

    // this should live in SchedukedHabitService
    public static getScheduledActiveHabitCount(
        scheduledHabits: ScheduledHabit[],
        plannedDayDate: Date
    ): number {
        const plannedDayDayOfWeek = plannedDayDate.getDay() + 1;

        // 1. reduce results to the day of the week we are on
        const scheduledHabitsForDayOfWeek = scheduledHabits.filter(
            (scheduledHabit) =>
                scheduledHabit.daysOfWeek?.some((dayOfWeek) => dayOfWeek.id === plannedDayDayOfWeek)
        );

        // 2. reduce results to the date range we are on
        const scheduledHabitsInDateRange = scheduledHabitsForDayOfWeek.filter((scheduledHabit) => {
            const startDate = scheduledHabit.startDate;
            const endDate = scheduledHabit.endDate;

            const startDateIsBeforePlannedDay = !startDate || plannedDayDate >= startDate;
            const endDateIsAfterPlannedDay = !endDate || plannedDayDate <= endDate;
            return startDateIsBeforePlannedDay && endDateIsAfterPlannedDay;
        });

        // 3. count the number of times of day, representing the actual number of scheduled habits
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
