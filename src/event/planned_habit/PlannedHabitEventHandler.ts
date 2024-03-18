import { PlannedDayService } from '@src/service/PlannedDayService';
import { Event } from '../events';

export class PlannedHabitEventHandler {
    public static async onCreated(event: Event.Event) {
        await PlannedDayService.updateCompletionStatusByPlannedHabitId(event.context, event.id);
    }

    public static async onUpdated(event: Event.Event) {
        await PlannedDayService.updateCompletionStatusByPlannedHabitId(event.context, event.id);
    }
}
