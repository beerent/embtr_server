import { Context } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace ChallengeParticipantEventDispatcher {
    export const onUpdated = (context: Context, plannedDayId: number, id: number) => {
        const event: Event.ChallengeParticipant.Event = {
            context,
            plannedDayId,
            id,
        };

        eventBus.emit(Event.ChallengeParticipant.Updated, event);
    };
}
