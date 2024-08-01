import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PlannedDayResultEventDispatcher {
    export const onCreated = (context: Context, id: number, dayKey: string) => {
        const event: Event.PlannedDayResult.Event = new Event.PlannedDayResult.Event(
            context,
            id,
            dayKey
        );
        eventBus.emit(Event.PlannedDayResult.Created, event);
    };

    export const onDeleted = (context: Context, id: number, dayKey: string) => {
        const event: Event.PlannedDayResult.Event = new Event.PlannedDayResult.Event(
            context,
            id,
            dayKey
        );
        eventBus.emit(Event.PlannedDayResult.Deleted, event);
    };
}
