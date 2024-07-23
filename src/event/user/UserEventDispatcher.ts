import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace UserEventDispatcher {
    export const onCreated = (context: Context) => {
        const event: Event.User.Event = new Event.User.Event(context);
        eventBus.emit(Event.User.Created, event);
    };

    export const onUpdated = (context: Context) => {
        const event: Event.User.Event = new Event.User.Event(context);
        eventBus.emit(Event.User.Updated, event);
    };

    export const onPremiumAdded = (context: Context) => {
        const event: Event.User.Event = new Event.User.Event(context);
        eventBus.emit(Event.User.PremiumAdded, event);
    };

    export const onPremiumRemoved = (context: Context) => {
        const event: Event.User.Event = new Event.User.Event(context);
        eventBus.emit(Event.User.PremiumRemoved, event);
    };

    export const onAway = (context: Context) => {
        const event: Event.User.Event = new Event.User.Event(context);
        eventBus.emit(Event.User.Away, event);
    };

    export const onReturned = (context: Context) => {
        const event: Event.User.Event = new Event.User.Event(context);
        eventBus.emit(Event.User.Returned, event);
    };
}
