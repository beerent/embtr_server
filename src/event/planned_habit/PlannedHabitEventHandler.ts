import { ChallengeService } from '@src/service/ChallengeService';
import { DetailedHabitStreakService } from '@src/service/DetailedHabitStreakService';
import { PlannedDayService } from '@src/service/PlannedDayService';
import { Event } from '../events';

export class PlannedHabitEventHandler {
    private static activeOnCreatedEvents = new Set<string>();
    private static activeOnUpdatedEvents = new Set<string>();
    private static activeOnCompletedEvents = new Set<string>();
    private static activeOnIncompletedEvents = new Set<string>();

    public static async onCreated(event: Event.PlannedHabit.Event) {
        const eventKey = event.getKey();

        if (this.activeOnCreatedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedHabit.Created, event);
            return;
        }

        this.activeOnCreatedEvents.add(eventKey);
        await Promise.all([
            PlannedDayService.updateCompletionStatusByPlannedHabitId(event.context, event.id),
            ChallengeService.updateChallengeRequirementProgress(event.context, event.id),
        ]);
        this.activeOnCreatedEvents.delete(eventKey);
    }

    public static async onUpdated(event: Event.PlannedHabit.Event) {
        const eventKey = event.getKey();

        if (this.activeOnUpdatedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedHabit.Updated, event);
            return;
        }

        this.activeOnUpdatedEvents.add(eventKey);
        await Promise.all([
            PlannedDayService.updateCompletionStatusByPlannedHabitId(event.context, event.id),
            ChallengeService.updateChallengeRequirementProgress(event.context, event.id),
        ]);
        this.activeOnUpdatedEvents.delete(eventKey);
    }

    public static async onCompleted(event: Event.PlannedHabit.Event) {
        const eventKey = event.getKey();

        if (this.activeOnCompletedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedHabit.Completed, event);
            return;
        }

        this.activeOnCompletedEvents.add(eventKey);
        await Promise.all([
            DetailedHabitStreakService.fullPopulateCurrentStreak(event.context, event.habitId),
            DetailedHabitStreakService.fullPopulateLongestStreak(event.context, event.habitId),
        ]);
        this.activeOnCompletedEvents.delete(eventKey);
    }

    public static async onIncompleted(event: Event.PlannedHabit.Event) {
        const eventKey = event.getKey();

        if (this.activeOnIncompletedEvents.has(eventKey)) {
            console.log('Already processing', Event.PlannedHabit.Incompleted, event);
            return;
        }

        this.activeOnIncompletedEvents.add(eventKey);
        await Promise.all([
            DetailedHabitStreakService.fullPopulateCurrentStreak(event.context, event.habitId),
            DetailedHabitStreakService.fullPopulateLongestStreak(event.context, event.habitId),
        ]);
        this.activeOnIncompletedEvents.delete(eventKey);
    }
}
