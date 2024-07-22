import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { PlannedDayResultEventHandler } from './PlannedDayResultEventHandler';

eventBus.on(Event.PlannedDayResult.Created, async (event: Event.PlannedDayResult.Event) => {
    try {
        logger.info(
            'PlannedDayResult event received: ' + Event.PlannedDayResult.Created + ' ' + event
        );
        PlannedDayResultEventHandler.onCreated(event);
    } catch (e) {
        console.error('error in PLANNED_DAY_RESULT_CREATED', e);
    }
});

eventBus.on(Event.PlannedDayResult.Deleted, async (event: Event.PlannedDayResult.Event) => {
    try {
        logger.info(
            'PlannedDayResult event received: ' + Event.PlannedDayResult.Deleted + ' ' + event
        );
        PlannedDayResultEventHandler.onDeleted(event);
    } catch (e) {
        console.error('error in PLANNED_DAY_RESULT_DELETED', e);
    }
});
