import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace ChallengeEventDispatcher {
    export const onJoined = (context: Context, id: number) => {
        const event: Event.Challenge.Event = new Event.Challenge.Event(context, id);
        eventBus.emit(Event.Challenge.Joined, event);
    };

    export const onLeft = (context: Context, id: number) => {
        const event: Event.Challenge.Event = new Event.Challenge.Event(context, id);
        eventBus.emit(Event.Challenge.Left, event);
    };

    export const onComplete = (context: Context, id: number) => {
        const event: Event.Challenge.Event = new Event.Challenge.Event(context, id);
        eventBus.emit(Event.Challenge.Completed, event);
    };

    export const onIncomplete = (context: Context, id: number) => {
        const event: Event.Challenge.Event = new Event.Challenge.Event(context, id);
        eventBus.emit(Event.Challenge.Incompleted, event);
    };
}
