import { PlannedDayService } from '@src/service/PlannedDayService';
import { Event } from '../events';

export class HabitStreakEventHandler {
    private static activeOnRefreshEvents = new Set<string>();

    public static async onRefresh(event: Event.HabitStreak.Event) {
        const eventKey = event.getKey();

        if (this.activeOnRefreshEvents.has(eventKey)) {
            console.log('Already processing', Event.HabitStreak.Refresh, event);
            return;
        }

        this.activeOnRefreshEvents.add(eventKey);
        await PlannedDayService.backPopulateMissingCompletionStatuses(event.context, event.userId);
        this.activeOnRefreshEvents.delete(eventKey);
    }
}
