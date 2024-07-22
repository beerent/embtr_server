import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { LevelEventHandler } from './LevelEventHandler';

eventBus.on(Event.Level.Updated, async (event: Event.Level.Event) => {
    try {
        logger.info('Level event received', Event.Level.Updated, event);
        LevelEventHandler.onUpdated(event);
    } catch (e) {
        console.error('error in' + Event.Level.Updated, e);
    }
});
