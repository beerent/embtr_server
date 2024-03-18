import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PlannedHabitEventDispatcher {
    export const onUpdated = (context: Context, id: number) => {
        const type: Event.Event = {
            context,
            id,
        };

        eventBus.emit(Event.PlannedHabit.Updated, type);
    };

    export const onCreated = (context: Context, id: number) => {
        const type: Event.Event = {
            context,
            id,
        };

        eventBus.emit(Event.PlannedHabit.Created, type);
    };
}
