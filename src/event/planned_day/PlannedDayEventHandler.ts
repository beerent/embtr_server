import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import { UserBadgeService } from '@src/service/UserBadgeService';
import { Event } from '../events';

export class PlannedDayEventHandler {
    private static activeOnUpdatedEvents = new Set<string>();

    public static async onUpdated(event: Event.PlannedDay.Event) {
        const eventKey = event.getKey();

        if (this.activeOnUpdatedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedDay.Updated, event);
            return;
        }

        this.activeOnUpdatedEvents.add(eventKey);

        await Promise.all([
            DetailedHabitStreakService.fullPopulateCurrentStreak(event.context),
            DetailedHabitStreakService.fullPopulateLongestStreak(event.context),
        ]);

        await UserBadgeService.refreshHabitStreakTierBadge(event.context);

        this.activeOnUpdatedEvents.delete(eventKey);
    }
}
