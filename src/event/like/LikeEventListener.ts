import eventBus from '../eventBus';
import { Event } from '../events';
import { LikeEventHandler } from './LikeEventHandler';

eventBus.on(Event.Like.Created, async (event: Event.Like.Event) => {
    try {
        LikeEventHandler.onCreated(event);
    } catch (e) {
        console.error('error in' + Event.Like.Created, e);
    }
});
