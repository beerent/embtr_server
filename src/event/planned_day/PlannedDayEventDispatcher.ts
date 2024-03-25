import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace PlannedDayEventDispatcher {
    export const onUpdated = (context: Context, userId: number, id: number) => {
        const type: Event.PlannedDay.Event = {
            context,
            userId,
            id,
        };

        eventBus.emit(Event.PlannedDay.Updated, type);
    };
}
