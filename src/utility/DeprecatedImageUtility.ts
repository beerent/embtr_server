import { PlannedTask, ScheduledHabit, Task } from '@resources/schema';

export class DeprecatedImageUtility {
    public static setPlannedTaskImages(plannedTask: PlannedTask) {
        if (plannedTask?.scheduledHabit) {
            this.setScheduledHabitImages(plannedTask.scheduledHabit);
        }

        plannedTask.remoteImageUrl =
            plannedTask.icon?.remoteImageUrl ??
            plannedTask.remoteImageUrl ??
            plannedTask.scheduledHabit?.remoteImageUrl;
        plannedTask.localImage =
            plannedTask.icon?.localImage ??
            plannedTask.localImage ??
            plannedTask.scheduledHabit?.localImage;
    }

    public static setScheduledHabitImages(scheduledHabit: ScheduledHabit) {
        if (scheduledHabit?.task) {
            this.setTaskImages(scheduledHabit.task);
        }

        if (scheduledHabit) {
            scheduledHabit.remoteImageUrl =
                scheduledHabit.icon?.remoteImageUrl ??
                scheduledHabit.remoteImageUrl ??
                scheduledHabit.task?.remoteImageUrl;
            scheduledHabit.localImage =
                scheduledHabit.icon?.localImage ??
                scheduledHabit.localImage ??
                scheduledHabit.task?.localImage;
        }
    }

    public static setTaskImages(task: Task) {
        task.remoteImageUrl = task.icon?.remoteImageUrl ?? task.remoteImageUrl;
        task.localImage = task.icon?.localImage ?? task.localImage;
    }
}
