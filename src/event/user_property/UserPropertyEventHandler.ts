import { Context } from '@src/general/auth/Context';
import { HabitStreakService } from '@src/service/HabitStreakService';
import { PlannedDayService } from '@src/service/PlannedDayService';
import { UserPropertyKey } from '@src/service/UserPropertyService';
import { Event } from '../events';

export class UserPropertyEventHandler {
    public static async onMissing(event: Event.ResourceEvent) {
        switch (event.key) {
            case UserPropertyKey.HABIT_STREAK_CURRENT:
                this.currentHabitStreakMissing(event.context, event.context.userId);
            case UserPropertyKey.HABIT_STREAK_LONGEST:
                this.longestHabitStreakMissing(event.context, event.context.userId);
        }
    }

    private static async currentHabitStreakMissing(context: Context, userId: number) {
        await PlannedDayService.backPopulateCompletionStatuses(context, userId);
        await HabitStreakService.fullPopulateCurrentStreak(context, userId);
    }

    private static async longestHabitStreakMissing(context: Context, userId: number) {
        //await PlannedDayService.backPopulateCompletionStatuses(context, userId);
        //await HabitStreakService.fullPopulateLongestStreak(context, userId);
    }
}
