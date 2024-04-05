import eventBus from '../eventBus';
import { Event } from '../events';
import { CommentEventHandler } from './CommentEventHandler';

eventBus.on(Event.Comment.Created, async (event: Event.Comment.Event) => {
    try {
        CommentEventHandler.onCreated(event);
    } catch (e) {
        console.error('error in' + Event.Comment.Created, e);
    }
});
