import { PlannedDayService } from '@src/service/PlannedDayService';
import { Event } from '../events';

export class PlannedHabitEventHandler {
    public static async onCreated(event: Event.PlannedHabit.Event) {
        PlannedDayService.updateCompletionStatusByPlannedHabitId(event.context, event.id);
    }

    public static async onUpdated(event: Event.PlannedHabit.Event) {
        PlannedDayService.updateCompletionStatusByPlannedHabitId(event.context, event.id);
    }
}
