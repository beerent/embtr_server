import { HabitStreakService } from '@src/service/HabitStreakService';
import { Event } from '../events';

export class PlannedDayEventHandler {
    public static async onUpdated(event: Event.Event) {
        HabitStreakService.fullPopulateCurrentStreak(event.context, event.context.userId);
        HabitStreakService.fullPopulateLongestStreak(event.context, event.context.userId);
    }
}
