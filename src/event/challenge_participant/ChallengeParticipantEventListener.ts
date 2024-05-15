import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { ChallengeParticipantEventHandler } from './ChallengeParticipantEventHandler';

eventBus.on(Event.ChallengeParticipant.Updated, (event: Event.ChallengeParticipant.Event) => {
    try {
        logger.info(
            'ChallengeParticipant event received',
            Event.ChallengeParticipant.Updated,
            event
        );
        ChallengeParticipantEventHandler.onUpdated(event);
    } catch (e) {
        console.error('error in', Event.ChallengeParticipant.Updated, e);
    }
});
