import { ScheduledHabit } from '@resources/schema';

export class ScheduledHabitUtil {
    public static getTitle(scheduledHabit?: ScheduledHabit): string {
        return scheduledHabit?.title ?? scheduledHabit?.task?.title ?? '';
    }

    public static getDescription(scheduledHabit?: ScheduledHabit): string {
        return scheduledHabit?.description ?? scheduledHabit?.task?.description ?? '';
    }

    public static getIcon(scheduledHabit?: ScheduledHabit) {
        return scheduledHabit?.icon ?? scheduledHabit?.task?.icon;
    }
}
