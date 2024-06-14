import { ChallengeService } from '@src/service/ChallengeService';
import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import { PlannedDayService } from '@src/service/PlannedDayService';
import { Event } from '../events';

export class PlannedHabitEventHandler {
    public static async onCreated(event: Event.PlannedHabit.Event) {
        PlannedDayService.updateCompletionStatusByPlannedHabitId(event.context, event.id);
        ChallengeService.updateChallengeRequirementProgress(event.context, event.id);
    }

    public static async onUpdated(event: Event.PlannedHabit.Event) {
        PlannedDayService.updateCompletionStatusByPlannedHabitId(event.context, event.id);
        ChallengeService.updateChallengeRequirementProgress(event.context, event.id);
    }

    public static async onCompleted(event: Event.PlannedHabit.Event) {
        DetailedHabitStreakService.fullPopulateCurrentStreak(event.context, event.habitId);
        DetailedHabitStreakService.fullPopulateLongestStreak(event.context, event.habitId);
    }

    public static async onIncompleted(event: Event.PlannedHabit.Event) {
        DetailedHabitStreakService.fullPopulateCurrentStreak(event.context, event.habitId);
        DetailedHabitStreakService.fullPopulateLongestStreak(event.context, event.habitId);
    }
}
