import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { LikeEventHandler } from './LikeEventHandler';

eventBus.on(Event.Like.Created, async (event: Event.Like.Event) => {
    try {
        logger.info('Like event received', Event.Like.Created, event);
        LikeEventHandler.onCreated(event);
    } catch (e) {
        console.error('error in' + Event.Like.Created, e);
    }
});
