import { ChallengeMilestoneService } from '@src/service/ChallengeMilestoneService';
import { Event } from '../events';

export class ChallengeParticipantEventHandler {
    public static async onProgressIncreased(event: Event.ChallengeParticipant.Event) {
        ChallengeMilestoneService.recalculateMilestonesOnIncrease(
            event.context,
            event.plannedDayId,
            event.id
        );
    }

    public static async onProgressDecreased(event: Event.ChallengeParticipant.Event) {
        ChallengeMilestoneService.recalulateMilestonesOnDecrease(
            event.context,
            event.plannedDayId,
            event.id
        );
    }
}
