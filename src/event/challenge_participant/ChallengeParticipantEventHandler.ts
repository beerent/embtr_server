import { ChallengeMilestoneService } from '@src/service/ChallengeMilestoneService';
import { Event } from '../events';

export class ChallengeParticipantEventHandler {
    public static async onUpdated(event: Event.ChallengeParticipant.Event) {
        ChallengeMilestoneService.setMilestones(event.context, event.plannedDayId, event.id);
    }
}
