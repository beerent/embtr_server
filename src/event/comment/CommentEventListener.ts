import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { CommentEventHandler } from './CommentEventHandler';

eventBus.on(Event.Comment.Created, async (event: Event.Comment.Event) => {
    try {
        logger.info('Comment event received', Event.Comment.Created, event);
        CommentEventHandler.onCreated(event);
    } catch (e) {
        console.error('error in' + Event.Comment.Created, e);
    }
});
