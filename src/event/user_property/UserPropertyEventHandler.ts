import { Constants } from '@resources/types/constants/constants';
import { Context } from '@src/general/auth/Context';
import { HabitStreakService } from '@src/service/HabitStreakService';
import { PlannedDayService } from '@src/service/PlannedDayService';
import { Event } from '../events';

export class UserPropertyEventHandler {
    public static async onMissing(event: Event.UserProperty.Event) {
        switch (event.key) {
            case Constants.UserPropertyKey.HABIT_STREAK_CURRENT:
                this.currentHabitStreakMissing(event.context, event.context.userId);
            case Constants.UserPropertyKey.HABIT_STREAK_LONGEST:
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
