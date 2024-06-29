import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace UserEventDispatcher {
    export const onCreated = (context: Context) => {
        const type: Event.User.Event = {
            context,
        };

        eventBus.emit(Event.User.Created, type);
    };

    export const onPremiumAdded = (context: Context) => {
        const type: Event.User.Event = {
            context,
        };

        eventBus.emit(Event.User.PremiumAdded, type);
    };

    export const onPremiumRemoved = (context: Context) => {
        const type: Event.User.Event = {
            context,
        };

        eventBus.emit(Event.User.PremiumRemoved, type);
    };

    export const onAway = (context: Context) => {
        const type: Event.User.Event = {
            context,
        };

        eventBus.emit(Event.User.Away, type);
    };

    export const onReturned = (context: Context) => {
        const type: Event.User.Event = {
            context,
        };

        eventBus.emit(Event.User.Returned, type);
    };
}
