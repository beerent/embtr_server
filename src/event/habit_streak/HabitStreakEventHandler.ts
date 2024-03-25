import { PlannedDayService } from '@src/service/PlannedDayService';
import { Event } from '../events';

export class HabitStreakEventHandler {
    public static onRefresh(event: Event.HabitStreak.Event) {
        PlannedDayService.backPopulateMissingCompletionStatuses(event.context, event.userId);
    }
}
