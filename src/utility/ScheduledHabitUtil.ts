import { ScheduledHabit } from '@resources/schema';

export class ScheduledHabitUtil {
    public static getTitle(scheduledHabit?: ScheduledHabit): string {
        return scheduledHabit?.title ?? scheduledHabit?.task?.title ?? '';
    }

    public static getDescription(scheduledHabit?: ScheduledHabit): string {
        return scheduledHabit?.description ?? scheduledHabit?.task?.description ?? '';
    }

    public static getRemoteImageUrl(scheduledHabit?: ScheduledHabit): string {
        return scheduledHabit?.remoteImageUrl ?? scheduledHabit?.task?.remoteImageUrl ?? '';
    }

    public static getLocalImage(scheduledHabit?: ScheduledHabit): string {
        return scheduledHabit?.localImage ?? scheduledHabit?.task?.localImage ?? '';
    }
}
