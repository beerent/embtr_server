import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace ChallengeEventDispatcher {
    export const onJoined = (context: Context, userId: number, id: number) => {
        const type: Event.Challenge.Event = {
            context,
            userId: userId,
            id: id,
        };

        eventBus.emit(Event.Challenge.Joined, type);
    };

    export const onLeft = (context: Context, userId: number, id: number) => {
        const type: Event.Challenge.Event = {
            context,
            userId: userId,
            id: id,
        };

        eventBus.emit(Event.Challenge.Left, type);
    };
}
