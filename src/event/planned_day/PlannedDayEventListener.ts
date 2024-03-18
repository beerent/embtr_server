import eventBus from '../eventBus';
import { Event } from '../events';
import { PlannedDayEventHandler } from './PlannedDayEventHandler';

eventBus.on(Event.PlannedDay.Updated, async (event: Event.Event) => {
    try {
        await PlannedDayEventHandler.onUpdated(event);
    } catch (e) {
        console.error('error in PLANNED_DAY_UPDATED', e);
    }
});
