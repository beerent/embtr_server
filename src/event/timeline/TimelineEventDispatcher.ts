import { UserContext } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace TimelineEventDispatcher {
    export const onAccessed = (context: UserContext) => {
        const event: Event.Timeline.Event = new Event.Timeline.Event(context);
        eventBus.emit(Event.Timeline.Accessed, event);
    };
}
