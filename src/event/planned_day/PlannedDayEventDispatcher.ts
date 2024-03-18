import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PlannedDayEventDispatcher {
    export const onUpdated = (context: Context, id: number) => {
        const type: Event.Event = {
            context,
            id,
        };

        eventBus.emit(Event.PlannedDay.Updated, type);
    };
}
