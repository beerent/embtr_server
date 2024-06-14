import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import { Event } from '../events';

export class PlannedDayEventHandler {
    public static async onUpdated(event: Event.PlannedDay.Event) {
        DetailedHabitStreakService.fullPopulateCurrentStreak(event.context);
        DetailedHabitStreakService.fullPopulateLongestStreak(event.context);
    }
}
