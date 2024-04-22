import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { PlannedDayEventHandler } from './PlannedDayEventHandler';

eventBus.on(Event.PlannedDay.Updated, async (event: Event.PlannedDay.Event) => {
    try {
        logger.info('PlannedDay event received', Event.PlannedDay.Updated, event);
        await PlannedDayEventHandler.onUpdated(event);
    } catch (e) {
        console.error('error in PLANNED_DAY_UPDATED', e);
    }
});
