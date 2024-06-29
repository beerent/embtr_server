import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import { UserBadgeService } from '@src/service/UserBadgeService';
import { Event } from '../events';

export class PlannedDayEventHandler {
    public static async onUpdated(event: Event.PlannedDay.Event) {
        await Promise.all([
            DetailedHabitStreakService.fullPopulateCurrentStreak(event.context),
            DetailedHabitStreakService.fullPopulateLongestStreak(event.context),
        ]);

        UserBadgeService.refreshHabitStreakTierBadge(event.context);
    }
}
