import { UserContext } from '@src/general/auth/Context';
import eventBus from '../eventBus';
import { Event } from '../events';

export namespace ChallengeParticipantEventDispatcher {
    export const onProgressIncreased = (context: UserContext, plannedDayId: number, id: number) => {
        const event: Event.ChallengeParticipant.Event = new Event.ChallengeParticipant.Event(
            context,
            plannedDayId,
            id
        );

        eventBus.emit(Event.ChallengeParticipant.ProgressIncreased, event);
    };

    export const onProgressDecreased = (context: UserContext, plannedDayId: number, id: number) => {
        const event: Event.ChallengeParticipant.Event = new Event.ChallengeParticipant.Event(
            context,
            plannedDayId,
            id
        );

        eventBus.emit(Event.ChallengeParticipant.ProgressDecreased, event);
    };
}
