import { logger } from '@src/common/logger/Logger';
import eventBus from '../eventBus';
import { Event } from '../events';
import { ChallengeParticipantEventHandler } from './ChallengeParticipantEventHandler';

eventBus.on(
    Event.ChallengeParticipant.ProgressIncreased,
    (event: Event.ChallengeParticipant.Event) => {
        try {
            logger.info(
                'ChallengeParticipant event received',
                Event.ChallengeParticipant.ProgressIncreased,
                event
            );
            ChallengeParticipantEventHandler.onProgressIncreased(event);
        } catch (e) {
            console.error('error in', Event.ChallengeParticipant.ProgressIncreased, e);
        }
    }
);

eventBus.on(
    Event.ChallengeParticipant.ProgressDecreased,
    (event: Event.ChallengeParticipant.Event) => {
        try {
            logger.info(
                'ChallengeParticipant event received',
                Event.ChallengeParticipant.ProgressDecreased,
                event
            );
            ChallengeParticipantEventHandler.onProgressDecreased(event);
        } catch (e) {
            console.error('error in', Event.ChallengeParticipant.ProgressDecreased, e);
        }
    }
);
