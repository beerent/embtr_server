import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace ChallengeEventDispatcher {
    export const onJoined = (context: Context, id: number) => {
        const type: Event.Challenge.Event = {
            context,
            id: id,
        };

        eventBus.emit(Event.Challenge.Joined, type);
    };

    export const onLeft = (context: Context, id: number) => {
        const type: Event.Challenge.Event = {
            context,
            id: id,
        };

        eventBus.emit(Event.Challenge.Left, type);
    };

    export const onComplete = (context: Context, id: number) => {
        const type: Event.Challenge.Event = {
            context,
            id: id,
        };

        eventBus.emit(Event.Challenge.Completed, type);
    };

    export const onIncomplete = (context: Context, id: number) => {
        const type: Event.Challenge.Event = {
            context,
            id: id,
        };

        eventBus.emit(Event.Challenge.Incompleted, type);
    };
}
