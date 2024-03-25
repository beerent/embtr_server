import { HabitStreakService } from '@src/service/HabitStreakService';
import { Event } from '../events';

export class PlannedDayEventHandler {
    public static async onUpdated(event: Event.PlannedDay.Event) {
        HabitStreakService.fullPopulateCurrentStreak(event.context, event.userId);
        HabitStreakService.fullPopulateLongestStreak(event.context, event.userId);
    }
}
