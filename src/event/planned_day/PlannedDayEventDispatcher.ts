import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PlannedDayEventDispatcher {
    export const onUpdated = (context: Context, userId: number, dayKey: string, id: number) => {
        const event: Event.PlannedDay.Event = new Event.PlannedDay.Event(
            context,
            userId,
            dayKey,
            id
        );
        eventBus.emit(Event.PlannedDay.Updated, event);
    };

    export const onCompleted = (context: Context, dayKey: string, id: number) => {
        const event: Event.PlannedDay.Event = new Event.PlannedDay.Event(
            context,
            context.userId,
            dayKey,
            id
        );
        eventBus.emit(Event.PlannedDay.Completed, event);
    };

    export const onIncompleted = (context: Context, dayKey: string, id: number) => {
        const event: Event.PlannedDay.Event = new Event.PlannedDay.Event(
            context,
            context.userId,
            dayKey,
            id
        );
        eventBus.emit(Event.PlannedDay.Incompleted, event);
    };
}
