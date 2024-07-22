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

eventBus.on(Event.PlannedDay.Completed, async (event: Event.PlannedDay.Event) => {
    try {
        logger.info('PlannedDay event received', Event.PlannedDay.Completed, event);
        await PlannedDayEventHandler.onCompleted(event);
    } catch (e) {
        console.error('error in PLANNED_DAY_COMPLETED', e);
    }
});

eventBus.on(Event.PlannedDay.Incompleted, async (event: Event.PlannedDay.Event) => {
    try {
        logger.info('PlannedDay event received', Event.PlannedDay.Incompleted, event);
        await PlannedDayEventHandler.onIncompleted(event);
    } catch (e) {
        console.error('error in PLANNED_DAY_INCOMPLETED', e);
    }
});
