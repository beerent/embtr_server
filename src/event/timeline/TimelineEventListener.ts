import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { TimelineEventHandler } from './TimelineEventHandler';

eventBus.on(Event.Timeline.Accessed, async (event: Event.Timeline.Event) => {
    try {
        logger.info(`Timeline event received ${Event.Timeline.Accessed} ${event}`);
        TimelineEventHandler.onAccessed(event);
    } catch (e) {
        console.error('error in Timeline.Accessed event', e);
    }
});
